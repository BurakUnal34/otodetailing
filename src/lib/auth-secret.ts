/**
 * NextAuth secret — Edge middleware dahil tüm ortamlarda Prisma/bcrypt import etmeden kullanılır.
 * Boş bırakılırsa yedek dize kullanılır; canlı ortamda mutlaka güçlü NEXTAUTH_SECRET tanımlayın.
 */
export function resolveNextAuthSecret(): string {
  const fromEnv = process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth] NEXTAUTH_SECRET / AUTH_SECRET tanımsız — geçici yedek anahtar kullanılıyor. Güvenlik için .env ile değiştirin.",
    );
  }
  return "otodetailing-dev-nextauth-secret-change-me-32chars-min";
}
