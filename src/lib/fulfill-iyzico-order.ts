import { buildPayload, sendOrderEmails } from "@/lib/fulfill-stripe-order";
import { retrieveCheckoutForm } from "@/lib/iyzico";
import { prisma } from "@/lib/prisma";

export type FulfillIyzicoResult =
  | { ok: true; alreadyPaid: boolean; orderId: string }
  | { ok: false; code: "no_iyzico" | "bad_token" | "unpaid" | "order_missing" | "stock"; message?: string };

/**
 * iyzico callback URL'sinden gelen token ile ödeme durumunu doğrular ve siparişi günceller.
 * `Order.stripeSessionId` alanı `iyz:<paymentId>` öneki ile iyzico için de kullanılır.
 */
export async function fulfillIyzicoOrderFromToken(token: string): Promise<FulfillIyzicoResult> {
  const detail = await retrieveCheckoutForm(token);
  if (!detail.ok) {
    return { ok: false, code: "no_iyzico", message: detail.errorMessage };
  }
  if (!detail.paid) {
    return { ok: false, code: "unpaid", message: detail.paymentStatus };
  }

  const orderId = detail.conversationId;
  if (!orderId) {
    return { ok: false, code: "bad_token" };
  }

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
      return { ok: false, code: "bad_token" } as const;
    }

    for (const item of order.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        return { ok: false, code: "stock" } as const;
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "ODENDI",
        stripeSessionId: detail.paymentId ? `iyz:${detail.paymentId}` : `iyz:${token}`,
      },
    });

    return { ok: true, alreadyPaid: false, order } as const;
  });

  if (txResult.ok && !txResult.alreadyPaid && txResult.order) {
    void sendOrderEmails(buildPayload(txResult.order));
  }

  if (!txResult.ok) return txResult;
  return { ok: true, alreadyPaid: txResult.alreadyPaid, orderId };
}
