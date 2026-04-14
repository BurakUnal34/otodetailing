import { prisma } from "@/lib/prisma";
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

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return { ok: false, code: "order_missing" } as const;

    if (order.status === "ODENDI") {
      return { ok: true, alreadyPaid: true } as const;
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

    return { ok: true, alreadyPaid: false } as const;
  });
}
