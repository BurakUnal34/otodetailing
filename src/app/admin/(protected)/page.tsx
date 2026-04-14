import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "Yönetim özeti" };

export default async function AdminHomePage() {
  const [productCount, lowStock, pendingOrders, paidOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 10 } } }),
    prisma.order.count({ where: { status: "BEKLEMEDE" } }),
    prisma.order.count({ where: { status: "ODENDI" } }),
  ]);

  const cards = [
    { label: "Toplam ürün", value: productCount, href: "/admin/urunler" },
    { label: "Düşük stok (≤10)", value: lowStock, href: "/admin/urunler" },
    { label: "Bekleyen sipariş", value: pendingOrders, href: "/admin/siparisler" },
    { label: "Ödenen sipariş", value: paidOrders, href: "/admin/siparisler" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-white">Özet</h1>
        <p className="mt-1 text-sm text-zinc-400">Stok ve sipariş durumlarını tek bakışta görün.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-brand-500/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
