import Link from "next/link";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";
import { formatTryFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AdminSiparislerPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { slug: true } } },
      },
    },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-white">Siparişler</h1>
      <p className="mt-1 text-sm text-zinc-500">Son 100 kayıt</p>

      <div className="mt-8 space-y-6">
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz sipariş yok.</p>
        ) : (
          orders.map((o) => (
            <article
              key={o.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-zinc-500">{o.id}</p>
                  <p className="mt-1 font-semibold text-white">{o.customerName}</p>
                  <p className="text-xs text-zinc-500">{o.customerEmail}</p>
                  {o.customerPhone && <p className="text-xs text-zinc-500">{o.customerPhone}</p>}
                  {o.shippingAddress && (
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
                      <span className="font-medium text-zinc-500">Adres: </span>
                      {o.shippingAddress}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-brand-300">{formatTryFromCents(o.totalCents)}</p>
                  <OrderStatusSelect orderId={o.id} value={o.status} />
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-zinc-800 pt-3 text-xs">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-2">
                    <span>
                      {it.productNameSnap} × {it.quantity}
                      {it.product && (
                        <>
                          {" "}
                          <Link href={`/urun/${it.product.slug}`} className="text-brand-400 hover:underline">
                            (mağaza)
                          </Link>
                        </>
                      )}
                    </span>
                    <span className="shrink-0 text-zinc-500">{formatTryFromCents(it.unitPriceCents * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-zinc-600">
                {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(o.createdAt)}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
