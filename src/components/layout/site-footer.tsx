import Link from "next/link";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { FooterSocial } from "@/components/layout/footer-social";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

const legalLinks = [
  { href: "/sayfa/kvkk", label: "KVKK" },
  { href: "/sayfa/gizlilik", label: "Gizlilik" },
  { href: "/sayfa/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/sayfa/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış" },
  { href: "/sayfa/iade-ve-cayma", label: "İade ve Cayma" },
  { href: "/sayfa/kullanim-kosullari", label: "Kullanım Koşulları" },
];

const shopLinks = [
  { href: "/urunler", label: "Tüm ürünler" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteFooter() {
  const b = getBusinessInfo();

  return (
    <footer className="relative border-t border-zinc-800 bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-amber-700 text-xs font-black text-zinc-950">
              OD
            </span>
            {SITE_NAME}
          </p>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            Profesyonel araç bakım ve temizlik ürünleri. Güvenli ödeme, hızlı kargo ve net içerik
            politikası ile mağaza deneyimi.
          </p>
          <ul className="space-y-1 pt-2 text-xs text-zinc-500">
            {b.legalName && <li>{b.legalName}</li>}
            {b.address && <li>{b.address}</li>}
            {b.phone && (
              <li>
                Tel: <a className="hover:text-brand-300" href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>
              </li>
            )}
            {b.email && (
              <li>
                E-posta:{" "}
                <a className="hover:text-brand-300" href={`mailto:${b.email}`}>
                  {b.email}
                </a>
              </li>
            )}
            {b.taxOffice && b.taxNumber && (
              <li>VD/VKN: {b.taxOffice} / {b.taxNumber}</li>
            )}
            {b.mersis && <li>MERSİS: {b.mersis}</li>}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-400/90">Mağaza</p>
          <ul className="mt-4 space-y-2 text-sm">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-zinc-300 transition hover:text-brand-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <FooterSocial />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-400/90">Yasal</p>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-zinc-300 transition hover:text-brand-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} {SITE_NAME}. Tüm hakları saklıdır.
      </div>
      <CookieBanner />
    </footer>
  );
}
