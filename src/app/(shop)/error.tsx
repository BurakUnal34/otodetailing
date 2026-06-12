"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => {
        /* Sentry yüklenemediyse sessizce geç */
      });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Hata</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Bir şeyler ters gitti
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          İşlem tamamlanırken bir sorun yaşandı. Tekrar denemeyi veya bir süre sonra geri
          dönmeyi deneyebilirsiniz.
        </p>
        {error.digest && (
          <p className="mt-3 text-[11px] text-zinc-600">
            Hata izleme: <code>{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400"
          >
            Yeniden dene
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-brand-500/40"
          >
            Ana sayfa
          </Link>
          <Link
            href="/iletisim"
            className="rounded-lg border border-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600"
          >
            Destek
          </Link>
        </div>
      </div>
    </div>
  );
}
