import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { formatTryFromCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Ürün" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/urun/${slug}` },
    openGraph: { title: product.name, type: "website" },
  };
}

export default async function UrunDetayPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: true },
  });

  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProductJsonLd product={product} category={product.category} />
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-brand-300">
          Ana sayfa
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/kategori/${product.category.slug}`} className="hover:text-brand-300">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-400">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600">Görsel yok</div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">{SITE_NAME}</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-brand-300">{formatTryFromCents(product.priceCents)}</p>
          <p className="mt-2 text-sm text-zinc-500">
            Stok: {inStock ? <span className="text-emerald-400">{product.stock} adet</span> : "Tükendi"}
          </p>

          <div className="mt-8 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {product.description}
          </div>

          <div className="mt-8 max-w-sm space-y-3">
            <AddToCart productId={product.id} disabled={!inStock} />
            <Link
              href={`/kategori/${product.category.slug}`}
              className="block text-center text-sm text-zinc-400 hover:text-brand-300"
            >
              Kategoriye dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
