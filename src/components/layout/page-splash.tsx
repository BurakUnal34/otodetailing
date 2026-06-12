"use client";

import { useEffect, useState } from "react";
import { brandInitials, SITE_NAME } from "@/lib/site-config";

const STORAGE_KEY = "otodetailing-intro-splash";

/** İlk oturumda ~3,5 sn tam ekran yükleme animasyonu; aynı sekmede tekrar gösterilmez. */
export function PageSplash({ durationMs = 3500, fadeMs = 550 }: { durationMs?: number; fadeMs?: number }) {
  const [mounted, setMounted] = useState(false);
  const [skip, setSkip] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setSkip(true);
        return;
      }
    } catch {
      /* private mode vb. */
    }

    document.body.dataset.splashLock = "1";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setExiting(true), durationMs);
    const t2 = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.splashLock;
      setGone(true);
    }, durationMs + fadeMs);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.splashLock;
    };
  }, [durationMs, fadeMs]);

  if (!mounted || skip || gone) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 transition-opacity ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      style={{ transitionDuration: `${fadeMs}ms` }}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Sayfa yükleniyor"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[60%] w-[60%] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-[50%] w-[50%] rounded-full bg-amber-600/10 blur-[90px]" />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-amber-700 text-2xl font-black tracking-tight text-zinc-950 shadow-2xl shadow-brand-900/50 ring-4 ring-brand-500/20">
          <span className="animate-pulse">{brandInitials()}</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-400">{SITE_NAME}</p>
          <p className="text-lg font-medium text-zinc-200">Mağaza hazırlanıyor…</p>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-800 sm:w-64" aria-hidden>
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 motion-reduce:w-full motion-reduce:animate-none animate-splash-bar" />
        </div>
      </div>
    </div>
  );
}
