"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

type Choice = "accepted" | "rejected";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== "accepted" && v !== "rejected") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function decide(choice: Choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* tarayıcı LocalStorage'ı engelliyorsa banner'ı yine de gizle */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-4 text-sm shadow-2xl shadow-black/60 backdrop-blur sm:inset-x-6 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="font-semibold text-white">Çerez kullanımı</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Sitenin çalışması için zorunlu çerezler kullanıyoruz. İsterseniz analitik çerezlere de izin
            verebilirsiniz. Detaylar için{" "}
            <Link href="/sayfa/cerez-politikasi" className="text-brand-300 underline-offset-2 hover:underline">
              çerez politikamıza
            </Link>{" "}
            ve{" "}
            <Link href="/sayfa/gizlilik" className="text-brand-300 underline-offset-2 hover:underline">
              gizlilik politikamıza
            </Link>{" "}
            bakın.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            Yalnızca zorunlu
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-brand-400"
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
