import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { SITE_NAME } from "@/lib/site-config";

export const revalidate = 60;

const desc =
  "Oto detailing ve araç bakım ürünleri: iç temizlik, dış yıkama, cila ve koruma. Tüm ürünler, fiyat ve stok bilgisiyle.";

export const metadata: Metadata = {
  title: "Ürünler",
  description: desc,
  alternates: { canonical: "/urunler" },
  openGraph: {
    title: `Ürünler | ${SITE_NAME}`,
    description: desc,
    url: "/urunler",
    type: "website",
  },
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true, slug: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-white">Tüm ürünler</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Fiyatlar ve stok bilgisi anlık olarak veritabanından gelir; ödeme öncesi tekrar doğrulanır.
        </p>
      </header>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
