import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProductsPage } from "@/lib/featured-products";
import { getHomeHeroSlides } from "@/lib/hero-slides";
import { prisma } from "@/lib/prisma";
import { FeaturedSection } from "@/components/shop/featured-section";
import { ProductSearch } from "@/components/shop/product-search";
import { HeroSlider } from "@/components/shop/hero-slider";
import { ServicesSlider } from "@/components/shop/services-slider";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | Profesyonel araç bakım ürünleri` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | Profesyonel araç bakım ürünleri`,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
};

export const revalidate = 60;

const FEATURED_PAGE_SIZE = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ sayfa?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const rawPage = Number.parseInt(sp.sayfa ?? "1", 10);
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [categories, featuredPayload] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getFeaturedProductsPage(requestedPage, FEATURED_PAGE_SIZE),
  ]);

  const { products: featured, page, totalPages, total } = featuredPayload;
  const heroSlides = getHomeHeroSlides();

  return (
    <div>
      <HeroSlider slides={heroSlides} />

      <section className="relative border-y border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 py-14 sm:py-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                Kategoriler
              </h2>
              <p className="mt-1.5 text-sm text-zinc-400">İhtiyacınıza göre hızlı gezinme.</p>
            </div>
            <Link
              href="/urunler"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200 transition hover:border-brand-400/60 hover:bg-brand-500/20 hover:text-brand-100"
            >
              Tüm ürünler
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-lg shadow-black/25 ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand-500/15 hover:ring-brand-500/25"
              >
                <span
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-400/20"
                  aria-hidden
                />
                <p className="relative text-sm font-bold text-white">{c.name}</p>
                {c.description && (
                  <p className="relative mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{c.description}</p>
                )}
                <span className="relative mt-4 inline-flex items-center text-xs font-semibold text-brand-400 transition group-hover:text-brand-300">
                  Keşfet
                  <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServicesSlider />

      <section
        id="one-cikanlar"
        className="mx-auto max-w-6xl scroll-mt-28 px-4 pb-16 pt-4 sm:px-6 sm:pt-6"
        tabIndex={-1}
      >
        <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="bg-gradient-to-r from-brand-200 via-brand-400 to-amber-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              Öne çıkanlar
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Yönetim panelinden eklenen ve yayında olan tüm ürünler. Sayfa başına {FEATURED_PAGE_SIZE} ürün.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-md">
            <ProductSearch variant="panel" placeholder="Öne çıkanlar içinde ara…" />
          </div>
        </div>
        <FeaturedSection
          key={`${page}-${total}-${FEATURED_PAGE_SIZE}`}
          initialProducts={featured}
          initialPage={page}
          totalPages={totalPages}
          total={total}
          pageSize={FEATURED_PAGE_SIZE}
        />
      </section>
    </div>
  );
}
