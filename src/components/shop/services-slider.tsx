"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type ServiceCard = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const DEFAULT_SERVICES: ServiceCard[] = [
  {
    title: "İç detay",
    description: "Koltuk, tavan ve konsol için derinlemesine temizlik ve bakım ürünleri.",
    href: "/kategori/ic-temizlik",
    imageSrc:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Araç içi detay temizlik",
  },
  {
    title: "Dış yıkama & köpük",
    description: "Güvenli şampuan, aktif köpük ve ön yıkama ile yüzey hazırlığı.",
    href: "/kategori/dis-yikama",
    imageSrc:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Araç dış yıkama",
  },
  {
    title: "Cila & koruma",
    description: "Wax, sealant ve seramik kaplama ile uzun süreli parlaklık ve koruma.",
    href: "/kategori/cila-koruma",
    imageSrc:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Parlak araç yüzeyi",
  },
  {
    title: "Mikrofiber & aksesuar",
    description: "Bezler, aplikatörler ve detay fırçaları ile profesyonel sonuç.",
    href: "/kategori/mikrofiber-aksesuar",
    imageSrc:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Detay aksesuarları",
  },
  {
    title: "Tüm ürünler",
    description: "Stokta olan tüm ürünleri tek sayfada filtreleyerek keşfedin.",
    href: "/urunler",
    imageSrc:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Oto detay ürünleri",
  },
];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export function ServicesSlider({ items = DEFAULT_SERVICES }: { items?: ServiceCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const updateActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.querySelectorAll<HTMLElement>("[data-service-card]"));
    if (children.length === 0) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    children.forEach((node, i) => {
      const mid = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateActive();
    el.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      el.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [updateActive]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.72, 280);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-service-card]")[index];
    if (!card) return;
    const target =
      card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  };

  return (
    <section
      className="relative border-y border-zinc-800/80 bg-zinc-950 py-14 sm:py-16"
      aria-labelledby="hizmetler-baslik"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="hizmetler-baslik"
              className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl"
            >
              Hizmetler
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              İhtiyacınıza göre kategorilere hızlı geçiş — kaydırın veya okları kullanın.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-200 shadow-lg shadow-black/30 transition hover:border-brand-500/50 hover:text-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              aria-label="Önceki hizmetler"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-200 shadow-lg shadow-black/30 transition hover:border-brand-500/50 hover:text-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              aria-label="Sonraki hizmetler"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>

        <div className="relative mt-8">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            role="region"
            aria-roledescription="kaydırılabilir liste"
            aria-label="Hizmet kartları"
          >
            {items.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                data-service-card
                className="group relative flex w-[min(100%,20rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/50 shadow-lg shadow-black/30 ring-1 ring-white/5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-brand-500/10 hover:ring-brand-500/20 sm:w-[min(100%,22rem)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={s.imageSrc}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 640px) 85vw, 22rem"
                    className="object-cover object-center transition duration-500 group-hover:scale-105"
                    quality={85}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-base font-bold text-white">{s.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{s.description}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-brand-400 transition group-hover:text-brand-300">
                    İncele
                    <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <div
            className="mt-6 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Hizmet slayt göstergeleri"
          >
            {items.map((s, index) => (
              <button
                key={s.href}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`${s.title} slaydı`}
                onClick={() => scrollToIndex(index)}
                className={[
                  "h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                  index === active ? "w-9 bg-brand-400" : "w-2 bg-zinc-600 hover:bg-zinc-500",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
