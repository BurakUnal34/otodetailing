import { NextResponse } from "next/server";
import { createCheckoutFormToken, getIyzicoConfig } from "@/lib/iyzico";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-config";

type Line = { productId?: unknown; quantity?: unknown };

const CHECKOUT_CAPACITY = 5;
const CHECKOUT_REFILL_PER_MS = 5 / (60 * 1000);

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function phoneDigits(s: string): string {
  return s.replace(/\D/g, "");
}
function priceToFixed(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * iyzico Checkout Form (CF) tabanlı ödeme akışı.
 * SANDBOX'ta test edilmeden üretime alınmamalıdır.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`checkout-iyzico:${ip}`, CHECKOUT_CAPACITY, CHECKOUT_REFILL_PER_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const config = getIyzicoConfig();
  if (!config) {
    return NextResponse.json(
      { error: "iyzico yapılandırılmadı (IYZICO_API_KEY/IYZICO_SECRET_KEY)." },
      { status: 503 },
    );
  }

  let body: {
    lines?: unknown;
    customerName?: unknown;
    customerEmail?: unknown;
    customerPhone?: unknown;
    shippingAddress?: unknown;
    identityNumber?: unknown;
    acceptsTerms?: unknown;
    hp?: unknown;
    formAgeMs?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  if (typeof body.hp === "string" && body.hp.length > 0) {
    return NextResponse.json({ error: "İstek geçersiz." }, { status: 400 });
  }
  const formAgeMs = typeof body.formAgeMs === "number" ? body.formAgeMs : 0;
  if (formAgeMs > 0 && formAgeMs < 1000) {
    return NextResponse.json({ error: "İstek çok hızlı gönderildi." }, { status: 400 });
  }
  if (body.acceptsTerms !== true) {
    return NextResponse.json({ error: "Mesafeli Satış Sözleşmesi onaylanmadı." }, { status: 400 });
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
  /** iyzico TC/Yabancı Kimlik No alanı zorunlu tutar (anonim "11111111111" kabul ediyor sandbox'ta). */
  const identityNumber =
    typeof body.identityNumber === "string" && /^\d{11}$/.test(body.identityNumber.trim())
      ? body.identityNumber.trim()
      : "11111111111";

  if (customerName.length < 2) {
    return NextResponse.json({ error: "Ad soyad en az 2 karakter olmalı." }, { status: 400 });
  }
  if (!isValidEmail(customerEmail)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }
  if (phoneDigits(customerPhoneRaw).length < 10) {
    return NextResponse.json(
      { error: "Telefon numarası zorunludur (en az 10 rakam)." },
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
    include: { category: { select: { name: true } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let totalCents = 0;
  const orderItems: {
    productId: string;
    quantity: number;
    unitPriceCents: number;
    productNameSnap: string;
    categoryName: string;
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
      categoryName: p.category?.name ?? "Genel",
    });
  }

  if (totalCents <= 0) {
    return NextResponse.json({ error: "Sipariş tutarı geçersiz." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      status: "BEKLEMEDE",
      totalCents,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items: {
        create: orderItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          productNameSnap: i.productNameSnap,
        })),
      },
    },
  });

  const base = getSiteUrl().replace(/\/$/, "");
  const callbackUrl = `${base}/api/iyzico/callback`;
  const ipAddr = ip === "unknown" ? "85.34.78.112" : ip;
  const [firstName, ...rest] = customerName.split(/\s+/);

  /** iyzico basket items toplamı price ile birebir eşleşmek zorunda. */
  const basketItems = orderItems.flatMap((i, idx) =>
    Array.from({ length: i.quantity }, (_, k) => ({
      id: `${i.productId}-${idx}-${k}`,
      name: i.productNameSnap.slice(0, 100),
      category1: i.categoryName.slice(0, 100),
      itemType: "PHYSICAL" as const,
      price: priceToFixed(i.unitPriceCents),
    })),
  );

  const result = await createCheckoutFormToken({
    conversationId: order.id,
    price: priceToFixed(totalCents),
    paidPrice: priceToFixed(totalCents),
    currency: "TRY",
    basketId: order.id,
    callbackUrl,
    buyer: {
      id: order.id,
      name: firstName || customerName,
      surname: rest.join(" ") || firstName || "Müşteri",
      email: customerEmail,
      identityNumber,
      registrationAddress: shippingAddress,
      city: "Istanbul",
      country: "Turkey",
      ip: ipAddr,
      gsmNumber: customerPhone,
    },
    shippingAddress: {
      contactName: customerName,
      city: "Istanbul",
      country: "Turkey",
      address: shippingAddress,
    },
    billingAddress: {
      contactName: customerName,
      city: "Istanbul",
      country: "Turkey",
      address: shippingAddress,
    },
    basketItems,
  });

  if (!result.ok) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
    return NextResponse.json(
      { error: result.errorMessage, errorCode: result.errorCode },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: result.paymentPageUrl, token: result.token });
}
