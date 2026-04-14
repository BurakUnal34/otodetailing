"use client";

import { useCallback, useRef, useState } from "react";
import type { ProductCardModel } from "@/components/shop/product-card";
import { ProductCard } from "@/components/shop/product-card";

type Props = {
  initialProducts: ProductCardModel[];
  initialPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

function writeSayfaToUrl(page: number) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname || "/";
  const qs = page <= 1 ? "" : `?sayfa=${page}`;
  window.history.replaceState(window.history.state, "", `${path}${qs}`);
}

export function FeaturedSection(props: Props) {
  const { initialProducts, initialPage, totalPages, total } = props;
  const [products, setProducts] = useState<ProductCardModel[]>(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollLock = useRef<number | null>(null);

  const goToPage = useCallback(
    async (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages || nextPage === page || loading) return;

      scrollLock.current = window.scrollY;
      setError(null);
      setLoading(true);

      try {
        const qs = nextPage <= 1 ? "" : `?sayfa=${nextPage}`;
        const res = await fetch(`/api/shop/featured${qs}`, { cache: "no-store" });
        if (!res.ok) throw new Error("İstek başarısız");
        const data = (await res.json()) as {
          products: ProductCardModel[];
          page: number;
        };
        setProducts(data.products);
        setPage(data.page);
        writeSayfaToUrl(data.page);

        (document.activeElement as HTMLElement | null)?.blur();

        const y = scrollLock.current;
        scrollLock.current = null;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (typeof y === "number") window.scrollTo(0, y);
          });
        });
      } catch {
        setError("Ürünler yüklenemedi. Tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    },
    [page, totalPages, loading],
  );

  const btnBase =
    "rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";
  const showNumbers = totalPages <= 8;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <div
        className={[
          "mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
          loading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
        aria-busy={loading}
      >
        {products.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">Henüz öne çıkarılacak ürün yok.</p>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}

      {totalPages > 1 && (
        <nav
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          aria-label="Öne çıkanlar sayfaları"
        >
          <div className="flex items-center gap-2">
            {page <= 1 ? (
              <span className={`${btnBase} border-zinc-800 text-zinc-600`}>Önceki</span>
            ) : (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void goToPage(page - 1)}
                disabled={loading}
                className={`${btnBase} border-zinc-700 text-zinc-200 hover:border-brand-500/50 hover:text-white disabled:opacity-50`}
              >
                Önceki
              </button>
            )}
            {page >= totalPages ? (
              <span className={`${btnBase} border-zinc-800 text-zinc-600`}>Sonraki</span>
            ) : (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void goToPage(page + 1)}
                disabled={loading}
                className={`${btnBase} border-zinc-700 text-zinc-200 hover:border-brand-500/50 hover:text-white disabled:opacity-50`}
              >
                Sonraki
              </button>
            )}
          </div>

          <p className="text-sm text-zinc-500">
            Sayfa <span className="font-semibold text-zinc-300">{page}</span> /{" "}
            <span className="font-semibold text-zinc-300">{totalPages}</span>
            <span className="ml-2 text-zinc-600">({total} ürün)</span>
          </p>

          {showNumbers && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {pages.map((p) => {
                const active = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!active && !loading) void goToPage(p);
                    }}
                    disabled={active || loading}
                    className={[
                      "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                      active
                        ? "cursor-default bg-brand-500 text-zinc-950"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-brand-500/40 hover:text-white",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      )}
    </>
  );
}
