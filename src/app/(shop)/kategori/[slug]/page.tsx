import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Kategori" };
  return {
    title: cat.name,
    description: cat.description ?? `${cat.name} kategorisi · ${SITE_NAME}`,
    alternates: { canonical: `/kategori/${slug}` },
  };
}

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          stock: true,
          imageUrl: true,
          category: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="border-b border-zinc-800 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Kategori</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">{category.description}</p>
        )}
        <Link href="/urunler" className="mt-4 inline-block text-sm font-medium text-brand-300 hover:text-brand-200">
          ← Tüm ürünler
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {category.products.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">Bu kategoride henüz ürün yok.</p>
        ) : (
          category.products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}
