import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { SITE_NAME, truncateMetaDescription } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Kategori" };
  const description = category.description
    ? truncateMetaDescription(category.description)
    : `${category.name} kategorisindeki oto detailing ürünleri — ${SITE_NAME}.`;
  const path = `/kategori/${category.slug}`;
  return {
    title: category.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description,
      url: path,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Kategori</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{category.name}</h1>
        {category.description && <p className="mt-2 text-sm text-zinc-400">{category.description}</p>}
      </header>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
