import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { ProductSearch } from "@/components/shop/product-search";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tüm ürünler",
  description: `${SITE_NAME} mağazasındaki tüm yayında ürünler.`,
  alternates: { canonical: "/urunler" },
};

export const revalidate = 60;

const PAGE_SIZE = 24;

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams?: Promise<{ sayfa?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const rawPage = Number.parseInt(sp.sayfa ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const total = await prisma.product.count({ where: { active: true } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) notFound();

  const skip = (page - 1) * PAGE_SIZE;
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      stock: true,
      imageUrl: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Tüm ürünler</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Toplam {total} ürün · Sayfa {page} / {totalPages}
          </p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-md">
          <ProductSearch variant="panel" placeholder="Ürün adıyla ara…" />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {rows.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">Henüz ürün yok.</p>
        ) : (
          rows.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Sayfalar">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const href = p <= 1 ? "/urunler" : `/urunler?sayfa=${p}`;
            const active = p === page;
            return (
              <Link
                key={p}
                href={href}
                className={[
                  "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold",
                  active ? "bg-brand-500 text-zinc-950" : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-brand-500/40",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
