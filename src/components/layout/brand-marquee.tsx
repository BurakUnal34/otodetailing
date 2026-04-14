import Image from "next/image";

/** Marka görselleri: site favicon servisi (sadece görsel, daire içinde). İsterseniz `public/brands/` altına kendi logolarınızı koyup `src` alanını `/brands/foo.png` yapın. */
const BRANDS: { name: string; domain: string }[] = [
  { name: "Meguiar's", domain: "meguiars.com" },
  { name: "Chemical Guys", domain: "chemicalguys.com" },
  { name: "SONAX", domain: "sonax.com" },
  { name: "Gyeon", domain: "gyeon.com" },
  { name: "CarPro", domain: "carpro.global" },
  { name: "Auto Finesse", domain: "autofinesse.co.uk" },
  { name: "Turtle Wax", domain: "turtlewax.com" },
  { name: "Koch-Chemie", domain: "kochchemie.com" },
  { name: "Autoglym", domain: "autoglym.com" },
  { name: "Mothers", domain: "mothers.com" },
];

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function BrandMarquee() {
  const track = [...BRANDS, ...BRANDS];

  return (
    <section
      className="border-t border-zinc-800 bg-zinc-950/80"
      aria-labelledby="brand-marquee-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <h2
          id="brand-marquee-heading"
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
        >
          Çalıştığımız markalar
        </h2>
        <div
          className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          aria-hidden
        >
          <div className="flex w-max items-center gap-10 sm:gap-14 motion-safe:animate-brand-marquee motion-reduce:animate-none">
            {track.map((b, i) => (
              <div
                key={`${b.domain}-${i}`}
                title={b.name}
                className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border border-zinc-700/90 bg-zinc-100 p-2.5 shadow-lg shadow-black/30 ring-2 ring-white/10 sm:h-[5rem] sm:w-[5rem] sm:p-3"
              >
                <Image
                  src={faviconUrl(b.domain)}
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain sm:h-11 sm:w-11"
                  loading="lazy"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
