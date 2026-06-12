import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950">
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">404</p>
          <h1 className="mt-3 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Sayfa bulunamadı
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.
            Aşağıdan ana sayfaya veya ürünler bölümüne dönebilirsiniz.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400"
            >
              Ana sayfa
            </Link>
            <Link
              href="/urunler"
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-brand-500/40"
            >
              Ürünlere göz at
            </Link>
            <Link
              href="/iletisim"
              className="rounded-lg border border-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600"
            >
              İletişim
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
