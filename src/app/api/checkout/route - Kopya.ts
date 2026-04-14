import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1)
    .max(50),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().max(40).optional().nullable(),
  shippingAddress: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const stripe = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!stripe || !baseUrl) {
    return NextResponse.json(
      { error: "Ödeme altyapısı yapılandırılmadı (STRIPE_SECRET_KEY / NEXTAUTH_URL)." },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const { items, customerEmail, customerName, customerPhone, shippingAddress } = parsed.data;

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let totalCents = 0;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItemsData: {
    productId: string;
    quantity: number;
    unitPriceCents: number;
    productNameSnap: string;
  }[] = [];

  for (const line of items) {
    const p = byId.get(line.productId);
    if (!p) {
      return NextResponse.json({ error: "Ürün bulunamadı veya pasif." }, { status: 400 });
    }
    if (p.stock < line.quantity) {
      return NextResponse.json(
        { error: `"${p.name}" için yeterli stok yok (kalan: ${p.stock}).` },
        { status: 409 },
      );
    }
    const lineTotal = p.priceCents * line.quantity;
    totalCents += lineTotal;
    orderItemsData.push({
      productId: p.id,
      quantity: line.quantity,
      unitPriceCents: p.priceCents,
      productNameSnap: p.name,
    });
    lineItems.push({
      quantity: line.quantity,
      price_data: {
        currency: "try",
        unit_amount: p.priceCents,
        product_data: {
          name: p.name,
          images: p.imageUrl ? [p.imageUrl] : undefined,
        },
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      status: "BEKLEMEDE",
      totalCents,
      customerEmail: customerEmail.toLowerCase(),
      customerName,
      customerPhone: customerPhone ?? undefined,
      shippingAddress: shippingAddress ?? undefined,
      items: { create: orderItemsData },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    success_url: `${baseUrl}/siparis/basarili?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/sepet?iptal=1`,
    metadata: { orderId: order.id },
    payment_intent_data: {
      metadata: { orderId: order.id },
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
