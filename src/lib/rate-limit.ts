/**
 * Bellek-içi (in-memory) basit token-bucket. Tek node için yeterli; çok sunuculu üretimde
 * Upstash/Redis gibi paylaşımlı bir store önerilir.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function gc() {
  if (buckets.size <= MAX_KEYS) return;
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [key, b] of buckets) {
    if (b.updatedAt < cutoff) buckets.delete(key);
    if (buckets.size <= MAX_KEYS / 2) break;
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * @param key benzersiz anahtar (genellikle IP + rota)
 * @param capacity kovadaki maksimum token (örn 5)
 * @param refillPerMs her ms'de eklenen token (örn 5/60_000 -> dakikada 5)
 */
export function rateLimit(key: string, capacity: number, refillPerMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  const tokens = existing
    ? Math.min(capacity, existing.tokens + (now - existing.updatedAt) * refillPerMs)
    : capacity;

  if (tokens < 1) {
    const need = 1 - tokens;
    const retryAfterMs = Math.ceil(need / refillPerMs);
    buckets.set(key, { tokens, updatedAt: now });
    return { ok: false, remaining: 0, retryAfterMs };
  }

  buckets.set(key, { tokens: tokens - 1, updatedAt: now });
  gc();
  return { ok: true, remaining: Math.floor(tokens - 1), retryAfterMs: 0 };
}

/** İstekten istemci IP'sini en güvenilir şekilde çıkartır. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
