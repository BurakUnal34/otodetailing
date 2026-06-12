#!/usr/bin/env node
/**
 * Build öncesi ortam değişkenlerini doğrulayan koruma scripti.
 *
 * - Vercel Production / Preview build'lerinde EKSİKLERDE BUILD'i DURDURUR.
 * - Lokal `npm run build` ve geliştirmede yalnızca uyarı yazar; build durmaz.
 *
 * Etkin olması için `package.json`'a `prebuild` olarak bağlanmıştır.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** İlk olarak .env varsa Node'un kendi env'ine yükle (Vercel zaten otomatik yapar). */
const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(__dirname, "..", ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2];
    }
  }
}

const isVercelProd =
  process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
const isProdLike = isVercelProd || process.env.NODE_ENV === "production";

const REQUIRED_PROD = [
  ["DATABASE_URL", (v) => v?.startsWith("postgres") || "PostgreSQL bağlantı string'i bekleniyor"],
  ["NEXTAUTH_URL", (v) => /^https:\/\//.test(v ?? "") || "https:// ile başlamalı"],
  ["NEXTAUTH_SECRET", (v) =>
    (v && v.length >= 32 && v !== "gelistirme-icin-uzun-rastgele-bir-dize-min-32-karakter") ||
    "Üretim için en az 32 karakterlik rastgele anahtar şart (`openssl rand -base64 32`)"],
  ["NEXT_PUBLIC_SITE_URL", (v) => /^https:\/\//.test(v ?? "") || "https:// ile başlamalı"],
];

const PAYMENT_REQUIREMENTS = {
  stripe: [
    ["STRIPE_SECRET_KEY", (v) => v?.startsWith("sk_") || "sk_live_ veya sk_test_ ile başlamalı"],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", (v) => v?.startsWith("pk_") || "pk_live_ veya pk_test_ ile başlamalı"],
    ["STRIPE_WEBHOOK_SECRET", (v) => v?.startsWith("whsec_") || "whsec_ ile başlamalı"],
  ],
  iyzico: [
    ["IYZICO_API_KEY", (v) => Boolean(v) || "Tanımlı olmalı"],
    ["IYZICO_SECRET_KEY", (v) => Boolean(v) || "Tanımlı olmalı"],
    ["IYZICO_BASE_URL", (v) => /^https:\/\//.test(v ?? "") || "https:// ile başlayan iyzico API URL'si"],
  ],
};

const RECOMMENDED_PROD = [
  ["BLOB_READ_WRITE_TOKEN", "Yoksa görseller her deploy'da silinir."],
  ["RESEND_API_KEY", "Sipariş onay e-postaları gönderilemez."],
  ["RESEND_FROM", "Resend için doğrulanmış gönderici adresi."],
  ["ORDER_NOTIFICATION_EMAIL", "Yöneticiye yeni sipariş e-postası iletilemez."],
  ["NEXT_PUBLIC_BUSINESS_LEGAL_NAME", "Footer ve mesafeli satış sözleşmesinde unvan görünmez."],
  ["NEXT_PUBLIC_BUSINESS_TAX_OFFICE", "VD bilgisi eksik."],
  ["NEXT_PUBLIC_BUSINESS_TAX_NUMBER", "VKN bilgisi eksik."],
  ["NEXT_PUBLIC_BUSINESS_PHONE", "Footer / iletişim sayfasında telefon görünmez."],
  ["NEXT_PUBLIC_BUSINESS_EMAIL", "Footer / iletişim sayfasında e-posta görünmez."],
];

const errors = [];
const warnings = [];

function check(list, target) {
  for (const [key, validator] of list) {
    const value = process.env[key];
    if (!value) {
      target.push(`  • ${key} tanımsız.`);
      continue;
    }
    const result = validator?.(value);
    if (result !== true && typeof result === "string") {
      target.push(`  • ${key}: ${result}`);
    }
  }
}

const provider = (process.env.PAYMENT_PROVIDER ?? "stripe").toLowerCase();
const paymentChecks = PAYMENT_REQUIREMENTS[provider] ?? PAYMENT_REQUIREMENTS.stripe;

if (isProdLike) {
  check(REQUIRED_PROD, errors);
  check(paymentChecks, errors);
  for (const [key, why] of RECOMMENDED_PROD) {
    if (!process.env[key]) warnings.push(`  • ${key} — ${why}`);
  }
} else {
  if (!process.env.DATABASE_URL) {
    warnings.push("  • DATABASE_URL tanımsız (Prisma çalıştırınca hata verir).");
  }
}

const banner = "─".repeat(64);

if (errors.length > 0) {
  console.error(`\n${banner}`);
  console.error("ENV KONTROLÜ — eksik / hatalı zorunlu değişkenler:\n");
  console.error(errors.join("\n"));
  console.error("");
  if (isProdLike) {
    console.error("Build durduruldu. Eksikleri tamamlayıp tekrar deneyin.");
    console.error(banner + "\n");
    process.exit(1);
  } else {
    console.warn("(Lokal build olduğu için durdurulmuyor.)");
    console.warn(banner + "\n");
  }
}

if (warnings.length > 0) {
  console.warn(`\n${banner}`);
  console.warn("ENV KONTROLÜ — önerilen değişkenler eksik:\n");
  console.warn(warnings.join("\n"));
  console.warn("\nBunlar olmadan da build geçer ama bazı özellikler çalışmaz.");
  console.warn(banner + "\n");
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`[env-check] OK · provider=${provider} · ${isProdLike ? "production" : "local"}`);
}
