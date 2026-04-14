import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTryFromCents } from "@/lib/money";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { absoluteUrl, SITE_NAME, truncateMetaDescription } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) return { title: "Ürün" };
  const description = truncateMetaDescription(product.description);
  const path = `/urun/${product.slug}`;
  const ogImage = product.imageUrl ? absoluteUrl(product.imageUrl) : undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: path,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProductJsonLd product={product} category={product.category} />
      <div className="mb-6 text-sm text-zinc-400">
        <Link href="/urunler" className="hover:text-white">
          Ürünler
        </Link>
        <span className="mx-2 text-zinc-600">/</span>
        <Link href={`/kategori/${product.category.slug}`} className="hover:text-white">
          {product.category.name}
        </Link>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500">Görsel yok</div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
            {product.category.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-brand-300">{formatTryFromCents(product.priceCents)}</p>
          {product.stock > 0 ? (
            <p className="mt-2 text-sm text-zinc-400">
              Stok: <span className="text-zinc-200">{product.stock}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm font-medium text-amber-200">Stoklar tükendi</p>
          )}
          <div className="mt-8 max-w-md">
            <AddToCart productId={product.id} disabled={product.stock <= 0} />
          </div>
          <div className="mt-10 space-y-3 text-sm leading-relaxed text-zinc-300">
            {product.description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
