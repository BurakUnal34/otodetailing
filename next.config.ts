import path from "path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/** Production HTTP güvenlik başlıkları. Stripe iframe / iyzico redirect'leri için
 *  X-Frame-Options DENY uygulanır (kendi sitemiz iframe içinde açılmasın),
 *  CSP koymadık çünkü Stripe.js/iyzico inline script ekleyebilir. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  /** Standalone build: Hostinger / VPS gibi self-host ortamlar için
   *  `.next/standalone/` altında self-contained bir Node sunucusu üretir.
   *  Vercel'de devre dışı bırakıyoruz; Vercel kendi optimize çıktısını kullanır. */
  output: process.env.VERCEL ? undefined : "standalone",
  /** Sharp native modül; paketlenince Turbopack/Webpack bazen bozuyor — yükleme ve diğer route’ları etkileyebilir. */
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  poweredByHeader: false,
  images: {
    /** Next.js 16 öncesi uyarı: kullanılan quality değerleri burada tanımlı olmalı */
    qualities: [75, 80, 85, 88, 90],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/**" },
      /** Vercel Blob ürün görselleri (*.public.blob.vercel-storage.com) */
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
    ];
  },
};

const sentryEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

/** Sentry build adımları (source map yükleme vb.) yalnızca SENTRY_AUTH_TOKEN/ORG/PROJECT tanımlıyken çalışır.
 *  DSN tanımlıysa runtime'da yine de hata raporlama aktiftir; kaynak haritası olmadan da çalışır. */
export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring-tunnel",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;
