"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type HeroSlideCta = { href: string; label: string };

export type HeroSlideContent = {
  label: string;
  title: string;
  description: string;
  primary: HeroSlideCta;
  secondary?: HeroSlideCta;
};

export type HeroSlide = {
  src: string;
  alt: string;
  content: HeroSlideContent;
};

const AUTO_MS = 6000;

const primaryBtn =
  "rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/30 transition hover:bg-brand-400";
const secondaryBtn =
  "rounded-lg border border-white/20 bg-zinc-950/40 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-brand-400/50 hover:bg-zinc-950/60";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  const current = count > 0 ? ((active % count) + count) % count : 0;
  const slide = slides[current];
  const content = slide.content;

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, goNext]);

  if (count === 0) return null;

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-zinc-950" aria-hidden />

      {slides.map((s, index) => (
        <div
          key={s.src}
          className={[
            "absolute inset-0 transition-opacity duration-[1000ms] ease-out motion-reduce:transition-none",
            index === current ? "z-[1] opacity-100" : "z-0 opacity-0",
          ].join(" ")}
          aria-hidden={index !== current}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
            quality={88}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/55 to-zinc-950/10"
            aria-hidden
          />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 md:justify-center md:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div key={current}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300 drop-shadow-sm">
              {content.label}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-200/95 drop-shadow sm:text-base">
              {content.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={content.primary.href} className={primaryBtn}>
                {content.primary.label}
              </Link>
              {content.secondary ? (
                <Link href={content.secondary.href} className={secondaryBtn}>
                  {content.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>

          {count > 1 && (
            <div className="mt-10 flex items-center gap-3" role="tablist" aria-label="Hero görselleri">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === current}
                  aria-label={`Slayt ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={[
                    "h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                    index === current ? "w-9 bg-brand-400" : "w-2 bg-zinc-600 hover:bg-zinc-500",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
