# Oto Detailing — E-ticaret

Next.js 15 (App Router) + Prisma + NextAuth + Stripe / iyzico tabanlı, Türkçe oto detailing
mağazası. Üretime almak için tam dokümantasyon `DEPLOY.md` içindedir.

## Hızlı başlangıç (lokal)

```powershell
# 1) Bağımlılıklar
npm ci

# 2) PostgreSQL (Docker)
npm run db:up

# 3) .env.example -> .env (Stripe test anahtarları yeterli)
Copy-Item .env.example .env

# 4) Şema + ilk veri
npx prisma migrate deploy
npm run db:seed

# 5) Geliştirme sunucusu
npm run dev
```

Ardından <http://localhost:3000> adresine gidin. Yönetim paneli için
<http://localhost:3000/admin/giris> (`admin@otodetailing.local` / `admin123`).

## Yararlı komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Üretim build'i (env-check + prisma generate + next build) |
| `npm run start` | Build sonrası prod modunda çalıştır |
| `npm run check:env` | Üretim env'lerinin tam olup olmadığını kontrol eder |
| `npm run db:up` / `db:down` | Yerel Docker PostgreSQL aç/kapa |
| `npm run db:seed` | Demo veri + ilk admin (idempotent) |
| `npm run db:backup` | Postgres yedeği (`backups/` altına .dump) |
| `npm run admin:create` | Tek admin oluştur / şifre sıfırla |

`npm run admin:create -- admin@alanadiniz.com` rastgele şifre üretir; ilk argüman e-posta,
ikincisi (opsiyonel) şifredir.

## Mimari özet

- **App Router**: `src/app/(shop)/...` müşteri tarafı, `src/app/admin/(protected)/...` yönetim.
- **API rotaları**: `src/app/api/...` — Stripe checkout, iyzico checkout, webhook'lar, admin CRUD.
- **Veritabanı**: Prisma + PostgreSQL. Şema `prisma/schema.prisma`, migration'lar `prisma/migrations/`.
- **Ödeme**: Stripe (varsayılan) veya iyzico. `PAYMENT_PROVIDER` env'i ile seçilir.
- **E-posta**: Resend (env yoksa no-op).
- **İzleme**: Vercel Analytics + Speed Insights (otomatik), GA4 ve Sentry env-gated.
- **Görsel yükleme**: Vercel Blob (üretim için zorunlu) veya `public/uploads` (lokal).
- **Yasal sayfalar**: `/sayfa/kvkk`, `/sayfa/gizlilik`, `/sayfa/cerez-politikasi`,
  `/sayfa/mesafeli-satis-sozlesmesi`, `/sayfa/iade-ve-cayma`, `/sayfa/kullanim-kosullari`.
  İşletme bilgileri `NEXT_PUBLIC_BUSINESS_*` env'lerinden okunur.

## Üretime alma

`DEPLOY.md` dosyasındaki adım adım rehberi izleyin. Vercel'e koyacağınız tüm değişkenler
için `production-env.txt` (gitignore'lu) dosyasını şablon olarak kullanabilirsiniz.

## Sağlık kontrolü

Canlıda <https://alanadiniz.com/api/healthcheck> rotası DB ping ve env durum özetini döner
(gizli değer içermez). UptimeRobot / BetterStack için doğrudan kullanılabilir.
