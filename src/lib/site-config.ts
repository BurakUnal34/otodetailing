import type { Metadata } from "next";

export const SITE_NAME = "Oto Detailing";

/** Ana sayfa ve şema için varsayılan açıklama */
export const SITE_DESCRIPTION =
  "İstanbul Bağcılar’da oto detailing mağazası: araç içi ve dışı temizlik, cila, koruma, şampuan ve profesyonel bakım ürünleri. Güvenli ödeme ve hızlı kargo ile online sipariş.";

/** Yerel işletme — site-map ile uyumlu */
export const BUSINESS_ADDRESS = {
  streetAddress: "Fevzi Çakmak Mah., 1986 Sk. No:2",
  addressLocality: "Bağcılar",
  addressRegion: "İstanbul",
  postalCode: "34200",
  addressCountry: "TR",
} as const;

export const BUSINESS_GEO = { latitude: 41.0410625, longitude: 28.8600414 } as const;

/** Geçersiz veya protokolsüz değerlerde asla throw etmez (metadataBase 500 hatasını önler). */
function normalizeOriginCandidate(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  let candidate = t.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const fromEnv = normalizeOriginCandidate(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) return fromEnv;
  const vercelRaw = process.env.VERCEL_URL?.trim();
  const fromVercel = normalizeOriginCandidate(
    vercelRaw ? (vercelRaw.startsWith("http") ? vercelRaw : `https://${vercelRaw}`) : undefined,
  );
  if (fromVercel) return fromVercel;
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  const base = getSiteUrl();
  try {
    return new URL(base.endsWith("/") ? base : `${base}/`);
  } catch {
    return new URL("http://localhost:3000/");
  }
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function socialProfileUrls(): string[] {
  const keys = [
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    process.env.NEXT_PUBLIC_SOCIAL_X,
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  ];
  return keys.filter((u): u is string => Boolean(u?.trim()));
}

export function buildOrganizationJsonLd() {
  const base = getSiteUrl();
  const sameAs = socialProfileUrls();
  const org = {
    "@type": ["Organization", "LocalBusiness"] as const,
    "@id": `${base}/#organization`,
    name: SITE_NAME,
    url: base,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.streetAddress,
      addressLocality: BUSINESS_ADDRESS.addressLocality,
      addressRegion: BUSINESS_ADDRESS.addressRegion,
      postalCode: BUSINESS_ADDRESS.postalCode,
      addressCountry: BUSINESS_ADDRESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
  return org;
}

export function buildWebSiteJsonLd() {
  const base = getSiteUrl();
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "tr-TR",
    publisher: { "@id": `${base}/#organization` },
  };
}

/** Kök layout için metadata alanları */
export function truncateMetaDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function rootMetadataExtras(): Pick<Metadata, "metadataBase" | "openGraph" | "twitter" | "robots" | "keywords"> {
  const base = getSiteUrl();
  return {
    metadataBase: getMetadataBase(),
    keywords: [
      "oto detailing",
      "araç bakım ürünleri",
      "iç temizlik",
      "dış yıkama",
      "cila",
      "seramik kaplama",
      "Bağcılar",
      "İstanbul",
      "oto şampuan",
      "mikrofiber",
    ],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Profesyonel araç bakım ürünleri`,
      description: SITE_DESCRIPTION,
      url: base,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | Profesyonel araç bakım ürünleri`,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}
