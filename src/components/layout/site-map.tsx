import { SITE_NAME } from "@/lib/site-config";

/** OpenStreetMap yerleşik harita (API anahtarı gerekmez). Konum + işaretçi .env ile değiştirilebilir. */
const shopAddress =
  "(Fevzi Çakmak, 1986 Sk No.2, 34200 Bağcılar/İstanbul)";
/** 1986. Sokak, Fevzi Çakmak — bbox merkez + marker (Nominatim) */
const fallbackEmbed =
  "https://www.openstreetmap.org/export/embed.html?bbox=28.8585%2C41.0404%2C28.8616%2C41.0417&layer=mapnik&marker=41.0410625%2C28.8600414";
const defaultEmbed = process.env.NEXT_PUBLIC_MAP_EMBED_URL || fallbackEmbed;

export function SiteMap() {
  return (
    <section className="border-t border-zinc-800 bg-zinc-900/30" aria-labelledby="site-map-heading">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="site-map-heading" className="text-lg font-bold text-white sm:text-xl">
              Konum
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Mağazamızı haritadan inceleyebilirsiniz.{" "}
              <span className="text-zinc-500">{shopAddress}</span>
            </p>
          </div>
          <a
            href="https://www.openstreetmap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            © OpenStreetMap katkıcıları
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-xl shadow-black/40 ring-1 ring-white/5">
          <iframe
            title={`${SITE_NAME} konum haritası`}
            src={defaultEmbed}
            className="aspect-[21/9] min-h-[220px] w-full max-h-[420px] bg-zinc-900 sm:min-h-[280px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
