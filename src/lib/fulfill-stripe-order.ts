import { prisma } from "@/lib/prisma";
import {
  renderAdminNewOrderEmail,
  renderOrderConfirmationEmail,
  sendMail,
  type OrderEmailPayload,
} from "@/lib/email";
import { getSiteUrl, SITE_NAME } from "@/lib/site-config";
import { getStripe } from "@/lib/stripe";

export type FulfillResult =
  | { ok: true; alreadyPaid: boolean }
  | { ok: false; code: "no_stripe" | "bad_session" | "unpaid" | "order_missing" };

export async function fulfillStripeOrderFromSession(sessionId: string): Promise<FulfillResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, code: "no_stripe" };

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;
  if (!orderId) return { ok: false, code: "bad_session" };
  if (session.payment_status !== "paid") return { ok: false, code: "unpaid" };

  const txResult = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return { ok: false, code: "order_missing" } as const;

    if (order.status === "ODENDI") {
      return { ok: true, alreadyPaid: true, order } as const;
    }
    if (order.status !== "BEKLEMEDE") {
      return { ok: false, code: "bad_session" } as const;
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "ODENDI", stripeSessionId: session.id },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return { ok: true, alreadyPaid: false, order } as const;
  });

  if (txResult.ok && !txResult.alreadyPaid && txResult.order) {
    void sendOrderEmails(buildPayload(txResult.order));
  }

  if (!txResult.ok) return txResult;
  return { ok: txResult.ok, alreadyPaid: txResult.alreadyPaid };
}

type OrderWithItems = NonNullable<
  Awaited<ReturnType<typeof prisma.order.findUnique>>
> & {
  items: Array<{
    productNameSnap: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

export function buildPayload(order: OrderWithItems): OrderEmailPayload {
  return {
    orderId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    totalCents: order.totalCents,
    items: order.items.map((i) => ({
      productNameSnap: i.productNameSnap,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
    siteName: SITE_NAME,
    siteUrl: getSiteUrl(),
  };
}

export async function sendOrderEmails(payload: OrderEmailPayload): Promise<void> {
  const adminTo = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  const customer = renderOrderConfirmationEmail(payload);

  await sendMail({
    to: payload.customerEmail,
    subject: customer.subject,
    html: customer.html,
    text: customer.text,
    replyTo: adminTo || undefined,
  });

  if (adminTo) {
    const admin = renderAdminNewOrderEmail(payload);
    await sendMail({
      to: adminTo,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: payload.customerEmail,
    });
  }
}
