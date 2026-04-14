import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";
import { formatTryFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AdminUrunlerPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Ürünler</h1>
          <p className="mt-1 text-sm text-zinc-500">Düzenleme ve silme</p>
        </div>
        <Link
          href="/admin/urunler/yeni"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-brand-400"
        >
          Yeni ürün
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Fiyat</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((p) => (
              <tr key={p.id} className="bg-zinc-950/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/urunler/${p.id}`} className="font-medium text-white hover:text-brand-300">
                    {p.name}
                  </Link>
                  <p className="text-xs text-zinc-600">/{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.category.name}</td>
                <td className="px-4 py-3 text-brand-200">{formatTryFromCents(p.priceCents)}</td>
                <td className="px-4 py-3 text-zinc-300">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={p.active ? "text-emerald-400" : "text-zinc-500"}>
                    {p.active ? "Yayında" : "Kapalı"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteProductButton id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">Henüz ürün yok.</p>
        )}
      </div>
    </div>
  );
}
