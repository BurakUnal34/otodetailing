"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /** Sentry'yi dinamik import edelim ki @sentry/nextjs'in sunucu bundle'ı
     *  global-error chunk'ına sızıp /404 prerender adımını bozmasın. */
    void import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error);
      })
      .catch(() => {
        /* Sentry yüklenemediyse sessizce geç */
      });
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#0a0a0a",
          color: "#e5e5e5",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#fbbf24",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            500
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 12, color: "#fff" }}>
            Beklenmeyen bir hata oluştu
          </h1>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: "#a3a3a3" }}>
            Sorun ekibimize otomatik iletildi. Lütfen sayfayı yenilemeyi deneyin veya
            ana sayfaya dönün.
          </p>
          {error.digest && (
            <p style={{ marginTop: 12, fontSize: 11, color: "#737373" }}>
              Hata izleme: <code>{error.digest}</code>
            </p>
          )}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              onClick={() => reset()}
              style={{
                background: "#f59e0b",
                color: "#0a0a0a",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px 18px",
                borderRadius: 8,
                border: 0,
                cursor: "pointer",
              }}
            >
              Yeniden dene
            </button>
            <Link
              href="/"
              style={{
                border: "1px solid #404040",
                color: "#e5e5e5",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 18px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Ana sayfa
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
