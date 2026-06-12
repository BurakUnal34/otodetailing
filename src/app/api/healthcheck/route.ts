import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Üretim sağlık kontrolü:
 *  - DB ping (Prisma raw query)
 *  - Kritik env'lerin tanımlı olup olmadığı
 *  - Aktif ödeme sağlayıcısı + e-posta + blob durumu
 *
 * Gizli değerleri ASLA dışarı vermez; yalnızca boolean / string flag'ler döner.
 * Üretimde uptime monitoring araçları (UptimeRobot, BetterStack, vb.) bu rotayı kullanabilir.
 */
export async function GET() {
  const startedAt = Date.now();
  const errors: string[] = [];

  let dbOk = false;
  let dbLatencyMs = -1;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch (err) {
    errors.push(`db: ${(err as Error).message}`);
  }

  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    SENTRY_DSN: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
    GA: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };

  const provider = (process.env.PAYMENT_PROVIDER ?? "stripe").toLowerCase();
  const paymentReady =
    provider === "iyzico"
      ? Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY)
      : Boolean(
          process.env.STRIPE_SECRET_KEY &&
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
            process.env.STRIPE_WEBHOOK_SECRET,
        );

  if (!env.DATABASE_URL) errors.push("DATABASE_URL tanımsız");
  if (!env.NEXTAUTH_SECRET) errors.push("NEXTAUTH_SECRET tanımsız");
  if (!paymentReady) errors.push(`payment[${provider}] yapılandırılmamış`);

  const ok = dbOk && errors.length === 0;
  const status = ok ? 200 : 503;

  return NextResponse.json(
    {
      ok,
      status: ok ? "healthy" : "degraded",
      uptime: process.uptime ? Math.round(process.uptime()) : null,
      checkedAt: new Date().toISOString(),
      took: Date.now() - startedAt,
      db: { ok: dbOk, latencyMs: dbLatencyMs },
      env,
      paymentProvider: provider,
      paymentReady,
      errors,
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
