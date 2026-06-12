import Link from "next/link";
import { HeaderCart } from "@/components/layout/header-cart";
import { ProductSearch } from "@/components/shop/product-search";
import { brandInitials, SITE_NAME, splitBrandName } from "@/lib/site-config";

export function SiteHeader() {
  const { top, bottom } = splitBrandName();
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/90 bg-zinc-950/80 shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label={SITE_NAME}
          className="group flex items-center gap-3 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-amber-700 text-sm font-black tracking-tighter text-zinc-950 shadow-lg shadow-brand-900/40 ring-2 ring-brand-300/30 transition group-hover:scale-[1.02] group-hover:shadow-brand-500/25"
            aria-hidden
          >
            {brandInitials()}
          </span>
          <span className="flex flex-col leading-none">
            {top ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-400">{top}</span>
            ) : null}
            <span className="text-base font-bold tracking-wide text-white">{bottom}</span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <ProductSearch variant="header" placeholder="Ürün ara…" />
          <HeaderCart />
        </div>
      </div>
    </header>
  );
}
