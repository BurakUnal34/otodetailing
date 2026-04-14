import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-config";
import { getStripe } from "@/lib/stripe";

type Line = { productId?: unknown; quantity?: unknown };

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function phoneDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Ödeme altyapısı yapılandırılmadı (STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  let body: {
    lines?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
    shippingAddress?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const linesRaw = Array.isArray(body.lines) ? body.lines : [];
  const lines: { productId: string; quantity: number }[] = [];
  for (const row of linesRaw as Line[]) {
    if (typeof row?.productId !== "string" || !row.productId) continue;
    const q = typeof row.quantity === "number" ? Math.floor(row.quantity) : Number.parseInt(String(row.quantity), 10);
    if (!Number.isFinite(q) || q < 1) continue;
    lines.push({ productId: row.productId, quantity: Math.min(99, q) });
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
  const customerPhoneRaw = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
  const shippingAddressRaw = typeof body.shippingAddress === "string" ? body.shippingAddress.trim() : "";

  if (customerName.length < 2) {
    return NextResponse.json({ error: "Ad soyad en az 2 karakter olmalı." }, { status: 400 });
  }
  if (!isValidEmail(customerEmail)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }
  if (phoneDigits(customerPhoneRaw).length < 10) {
    return NextResponse.json(
      { error: "Telefon numarası zorunludur (en az 10 rakam, örn. 05xx xxx xx xx)." },
      { status: 400 },
    );
  }
  if (shippingAddressRaw.length < 10) {
    return NextResponse.json(
      { error: "Ev / teslimat adresi zorunludur (en az 10 karakter)." },
      { status: 400 },
    );
  }

  const customerPhone = customerPhoneRaw.slice(0, 40);
  const shippingAddress = shippingAddressRaw.slice(0, 500);

  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  const orderItems: {
    productId: string;
    quantity: number;
    unitPriceCents: number;
    productNameSnap: string;
  }[] = [];

  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p) {
      return NextResponse.json({ error: "Sepette geçersiz ürün var." }, { status: 400 });
    }
    if (p.stock < line.quantity) {
      return NextResponse.json(
        { error: `"${p.name}" için yeterli stok yok (kalan: ${p.stock}).` },
        { status: 400 },
      );
    }
    totalCents += p.priceCents * line.quantity;
    orderItems.push({
      productId: p.id,
      quantity: line.quantity,
      unitPriceCents: p.priceCents,
      productNameSnap: p.name,
    });
  }

  if (totalCents <= 0) {
    return NextResponse.json({ error: "Sipariş tutarı geçersiz." }, { status: 400 });
  }

  const base = getSiteUrl().replace(/\/$/, "");

  const order = await prisma.order.create({
    data: {
      status: "BEKLEMEDE",
      totalCents,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items: { create: orderItems },
    },
  });

  const stripeLineItems = orderItems.map((item) => {
    const p = byId.get(item.productId)!;
    const images =
      p.imageUrl && (p.imageUrl.startsWith("http://") || p.imageUrl.startsWith("https://"))
        ? [p.imageUrl]
        : undefined;
    return {
      quantity: item.quantity,
      price_data: {
        currency: "try",
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.productNameSnap,
          ...(images ? { images } : {}),
        },
      },
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: stripeLineItems,
      metadata: { orderId: order.id },
      success_url: `${base}/siparis/tesekkurler?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/sepet`,
    });

    if (!session.url) {
      await prisma.order.delete({ where: { id: order.id } });
      return NextResponse.json({ error: "Ödeme oturumu oluşturulamadı." }, { status: 500 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    return NextResponse.json({ error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
