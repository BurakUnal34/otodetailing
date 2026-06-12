# Canlıya geçiş rehberi (Vercel + Postgres)

Bu site Next.js 15 (App Router) + Prisma + NextAuth + Stripe üzerine kuruludur.
Aşağıdaki adımları sırayla izleyin.

## 0. Ön gereksinimler

- Yönetilen PostgreSQL (Neon, Supabase veya Vercel Postgres) — bağlantı string'i hazır
- Vercel hesabı (önerilir) ve bağlanmış Git deposu
- Stripe hesabı + canlı (live) anahtarları
- Resend hesabı (e-posta için, opsiyonel ama önerilir)
- Alan adı (DNS Vercel'e yönlendirilmiş)

## 1. Repo hazırlığı (yerelde)

```bash
git status                  # temiz olmalı
npm ci
npm run db:up               # yerel postgres (Docker) - test amaçlı
npx prisma migrate deploy   # prisma/migrations klasörü uygulanır
npm run db:seed             # ilk admin + demo veri
npm run build               # build hatasız geçmeli
```

Mevcut bir veritabanına ilk kez `prisma migrate` ekliyorsanız (örn. eskiden `db push` ile
çalıştıysanız), bir kerelik baseline:

```bash
npx prisma migrate resolve --applied 20260429_init
```

## 2. Veritabanı kurulumu (üretim)

1. Yönetilen Postgres üzerinde yeni bir veritabanı açın.
2. Bağlantı string'ini alın, sonuna `?sslmode=require` ekleyin.
3. Vercel projenizde `DATABASE_URL` environment variable'ı olarak tanımlayın.

Migration'lar Vercel build sırasında `vercel.json` içindeki
`prisma migrate deploy` komutuyla otomatik uygulanır.

## 3. Vercel environment variables

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | Postgres bağlantı string'i (`?sslmode=require` ile) |
| `NEXTAUTH_URL` | `https://alanadiniz.com` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://alanadiniz.com` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook tanımlandıktan sonra (`whsec_...`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Storage → Blob → Create Token |
| `RESEND_API_KEY` | Resend API key (opsiyonel) |
| `RESEND_FROM` | `Marka <noreply@alanadiniz.com>` (Resend'de doğrulanmış domain) |
| `ORDER_NOTIFICATION_EMAIL` | Yöneticiye sipariş bildirimi atılacak adres |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | İlk seed sırasında oluşturulacak hesap (sonra panelden değişti­rilir; production'da boş bırakılırsa rastgele şifre üretilir ve build log'una bir kez yazılır) |
| `NEXT_PUBLIC_BUSINESS_*` | Yasal sayfa ve footer için işletme bilgileri (unvan, vergi, MERSİS, telefon, e-posta) |
| `NEXT_PUBLIC_SOCIAL_*` | Sosyal medya URL'leri |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | WhatsApp butonu için (yalnız rakam) |

## 4. Stripe webhook

Stripe Dashboard → Developers → Webhooks → **Add endpoint**:

- URL: `https://alanadiniz.com/api/webhooks/stripe`
- Event: `checkout.session.completed`

Oluşturduktan sonra **Signing secret**'ı kopyalayıp Vercel'de `STRIPE_WEBHOOK_SECRET`
olarak tanımlayın ve **Redeploy** edin.

## 5. İlk deploy

1. `git push` → Vercel otomatik build başlatır.
2. Build başarılı olduktan sonra **ilk admin'i** lokal makinenizden tek seferlik komutla oluşturun:
   ```powershell
   $env:DATABASE_URL="postgresql://..."   # Vercel'deki ile aynı
   npm run admin:create -- info@alanadiniz.com
   ```
   Rastgele güçlü şifre üretilir ve terminale **bir kez** yazılır — kopyalayın.
3. `https://alanadiniz.com/admin/giris` üzerinden giriş yapın.
4. **/admin/hesabim** sayfasından şifreyi hemen değiştirin.

> Demo kategori + ürün eklemek isterseniz `npm run db:seed` çalıştırabilirsiniz; production
> ortamında `db:seed` yalnızca admin oluşturur, demo ürün eklemez.

## 6. Ön-uçuş kontrolü

- [ ] Ana sayfa açılıyor, ürünler listeleniyor
- [ ] `/iletisim`, `/sayfa/kvkk`, `/sayfa/mesafeli-satis-sozlesmesi` sayfaları açılıyor
- [ ] Çerez bildirimi alt köşede çıkıyor, "Tümünü kabul" tıklanınca kayboluyor
- [ ] Sepete ürün ekleyip **mesafeli satış onayı kutucuğu** olmadan ödemeye geçilemiyor
- [ ] Test kart (`4242 4242 4242 4242`) ile ödeme tamamlanıyor
- [ ] Stripe webhook ile sipariş `ODENDI` durumuna geçiyor
- [ ] Müşteriye ve yöneticiye onay e-postası gidiyor (Resend yapılandırıldıysa)
- [ ] Admin panelinde sipariş ve düşen stok görünüyor
- [ ] `npm run build` lokal makinede temiz çalışıyor

## 7. iyzico'ya geçiş (alternatif ödeme)

Stripe yerine iyzico kullanmak için:

1. iyzico panelinden **API Key** ve **Secret Key** alın (önce sandbox, sonra prod).
2. Vercel'e şu env değişkenlerini ekleyin:
   - `PAYMENT_PROVIDER=iyzico`
   - `NEXT_PUBLIC_PAYMENT_PROVIDER=iyzico`
   - `IYZICO_API_KEY=...`
   - `IYZICO_SECRET_KEY=...`
   - `IYZICO_BASE_URL=https://sandbox-api.iyzipay.com` (önce sandbox)
3. Yeniden deploy edin. Sepet formu artık `/api/checkout-iyzico`'ya istek atar ve müşteri iyzico Checkout Form'una yönlendirilir.
4. iyzico panelinde **Callback URL**'i `https://alanadiniz.com/api/iyzico/callback` olarak tanımlayın.
5. Sandbox kart numaralarıyla uçtan uca test edin (kimlik no `11111111111` ile geçer).
6. Hazırsanız `IYZICO_BASE_URL=https://api.iyzipay.com` yapıp prod credentials'a geçin.

> Stripe ile iyzico aynı anda kurulu olabilir; aktif sağlayıcıyı `PAYMENT_PROVIDER` belirler.

## 8. İzleme (Sentry & Vercel Analytics)

- **Vercel Analytics** ve **Speed Insights** zaten kuruludur, env gerekmez. Vercel projesi Settings → Analytics'ten açın.
- **Sentry** (opsiyonel):
  - `NEXT_PUBLIC_SENTRY_DSN` (ve istenirse `SENTRY_DSN`) tanımlandığında runtime hata raporlama otomatik aktif.
  - Source map upload için `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` üçü birlikte tanımlandığında `next.config.ts` bunu build adımına dahil eder.

## 9. Sağlık & operasyon

- **Sağlık ucu**: `https://alanadiniz.com/api/healthcheck` — DB ping ve env durum özeti (gizli değer içermez).
  UptimeRobot / BetterStack ile dakikalık check yapabilirsiniz; 503 dönerse alarm.
- **DB yedek**: `npm run db:backup` ile `backups/` altına `.dump` dosyası yazılır
  (production DATABASE_URL'i ortama yükleyip çalıştırın).
- **Admin yönetimi**: `npm run admin:create -- e-posta` rastgele şifre üretir;
  `npm run admin:create -- e-posta belirli-sifre` belirtilen şifreyi atar; aynı e-posta varsa
  şifreyi sıfırlar.

## 10. Sonraki iyileştirme önerileri

- IP bazlı rate-limit şu an in-memory. Çok sunuculu ortamda **Upstash Redis** ile değiştirin (`src/lib/rate-limit.ts`).
- Gerçek ürün görselleriyle `public/img/` altındaki dosyaları (1.png, 2.png ...) değiştirin veya admin panelinden ürün görsellerini yükleyin.
- Hero slaytları `NEXT_PUBLIC_HERO_SLIDES` env değişkeniyle JSON olarak override edilebilir.
- **Apple Pay / Google Pay** Stripe panelinde domain doğrulayarak otomatik aktive olur.

---

## Yerel geliştirme (özet)

```bash
docker compose up -d                      # PostgreSQL
cp .env.example .env                      # ve değerleri doldurun
npm ci
npx prisma migrate deploy
npm run db:seed
npm run dev
```
