import type { Metadata } from "next";
import { BUSINESS_ADDRESS, getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${SITE_NAME} iletişim bilgileri ve adres.`,
  alternates: { canonical: "/iletisim" },
};

const mapEmbedUrl =
  process.env.NEXT_PUBLIC_MAP_EMBED_URL ||
  "https://www.openstreetmap.org/export/embed.html?bbox=28.8585%2C41.0404%2C28.8616%2C41.0417&layer=mapnik&marker=41.0410625%2C28.8600414";

export default function IletisimPage() {
  const b = getBusinessInfo();
  const a = BUSINESS_ADDRESS;
  const whatsappLink = b.whatsapp
    ? `https://wa.me/${b.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-zinc-800 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">İletişim</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Bize ulaşın
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Sipariş, iade ve teknik sorularınız için aşağıdaki kanallardan bize yazabilir, mağazamıza
          uğrayabilirsiniz. En kısa sürede dönüş yapıyoruz.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">İşletme bilgileri</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {b.legalName && (
                <Row label="Unvan" value={b.legalName} />
              )}
              <Row label="Marka" value={b.brandName} />
              <Row
                label="Adres"
                value={`${a.streetAddress}, ${a.postalCode} ${a.addressLocality}/${a.addressRegion}`}
              />
              {b.phone && (
                <Row label="Telefon" value={<a className="text-brand-300 hover:text-brand-200" href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>} />
              )}
              {whatsappLink && (
                <Row
                  label="WhatsApp"
                  value={
                    <a
                      className="text-brand-300 hover:text-brand-200"
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {b.whatsapp}
                    </a>
                  }
                />
              )}
              {b.email && (
                <Row
                  label="E-posta"
                  value={
                    <a className="text-brand-300 hover:text-brand-200" href={`mailto:${b.email}`}>
                      {b.email}
                    </a>
                  }
                />
              )}
              {b.taxOffice && b.taxNumber && (
                <Row label="Vergi Dairesi / No" value={`${b.taxOffice} / ${b.taxNumber}`} />
              )}
              {b.mersis && <Row label="MERSİS No" value={b.mersis} />}
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">Çalışma saatleri</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li className="flex justify-between">
                <span>Pazartesi – Cumartesi</span>
                <span className="text-zinc-400">09:00 – 19:00</span>
              </li>
              <li className="flex justify-between">
                <span>Pazar</span>
                <span className="text-zinc-400">Kapalı</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-zinc-500">
              Kargo siparişleri hafta içi 16:00&apos;a kadar olanlar aynı gün hazırlanır.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <div className="aspect-square w-full sm:aspect-[4/3] lg:aspect-square">
            <iframe
              title="Mağaza konumu"
              src={mapEmbedUrl}
              loading="lazy"
              className="h-full w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm text-zinc-100">{value}</dd>
    </div>
  );
}
