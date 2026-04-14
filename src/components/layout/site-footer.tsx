import { FooterSocial } from "@/components/layout/footer-social";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-zinc-800 bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md space-y-3">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-amber-700 text-xs font-black text-zinc-950">
              OD
            </span>
            Oto Detailing
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Profesyonel araç bakım ve temizlik ürünleri. Güvenli ödeme, hızlı kargo ve net içerik
            politikası ile mağaza deneyimi.
          </p>
        </div>
        <FooterSocial />
      </div>
      <div className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Oto Detailing
      </div>
    </footer>
  );
}
