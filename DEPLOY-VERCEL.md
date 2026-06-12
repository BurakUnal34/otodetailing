# Vercel + Hostinger Domain ile Canlıya Çıkış

Bu Next.js projesini Vercel'in **ücretsiz Hobby** planında barındırırız;
domain'i Hostinger'da bırakıp sadece DNS'i Vercel'e yönlendiririz.

> Toplam süre: **15–20 dakika**. Maliyet: **0 TL** (alan adı dışında).

---

## 0) Yol haritası

```
[1] vercel.com'a GitHub ile kayıt ol
[2] BurakUnal34/otodetailing repo'sunu içe aktar
[3] Vercel Postgres ekle (otomatik DATABASE_URL)
[4] Diğer environment variable'ları gir
[5] Deploy → 2-3 dakikada hazır
[6] Şemayı yükle + admin oluştur (yerelden tek komut)
[7] Stripe webhook tanımla
[8] Custom domain ekle (alanadiniz.com)
[9] Hostinger DNS Zone'a kayıtları gir
[10] SSL otomatik aktif → site canlıda
```

---

## 1) Vercel kaydı + repo bağlama

1. <https://vercel.com> → **Sign Up** → "Continue with GitHub"
2. Yetki ister, "Authorize Vercel" → GitHub'a yetki ver
3. Açılan dashboard'da **Add New** → **Project**
4. **Import Git Repository** listesinde `BurakUnal34/otodetailing` görünür → **Import**
5. **Framework Preset**: otomatik "Next.js" algılar
6. **Build & Output Settings** kısmını ELLEME — `vercel.json` zaten doğru komutu içeriyor
7. **Environment Variables** kısmına geçeceğiz, ama önce DB ekleyelim — şimdilik **Deploy butonuna BASMAYIN**, sayfayı açık bırakın

---

## 2) Vercel Postgres ekle

> Vercel'in entegre Postgres'i aslında **Neon altyapısı** üzerinde çalışır.
> Ücretsiz tier: 256 MB depolama, sınırsız veritabanı, 60 saatlik compute/ay
> (proje küçükken yeterli; sonradan büyütebilirsiniz).

1. Vercel dashboard üst menü → **Storage** sekmesi
2. **Create Database** → **Postgres**
3. Database adı: `otodetailing-db`
4. Region: **Frankfurt (fra1)** (Türkiye'ye en yakın)
5. **Create**
6. Açılan ekranda **"Connect Project"** → projemiz `otodetailing`'i seç → Connect
7. Vercel otomatik olarak şu env değişkenlerini Production + Preview'a ekler:
   - `POSTGRES_URL` (havuzlu, app için)
   - `POSTGRES_PRISMA_URL` (Prisma için optimize, **bunu kullanacağız**)
   - `POSTGRES_URL_NON_POOLING` (migration için, **bunu da kullanacağız**)
   - `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

8. **DATABASE_URL** olarak kullanmamız için iki ek değişken tanımlamak lazım
   (Vercel Postgres bunları doğrudan vermez; biz manuel mapleyeceğiz):

   - Project → Settings → **Environment Variables** → **Add**:
     - Name: `DATABASE_URL`
     - Value: `POSTGRES_PRISMA_URL` değerinin aynısını yapıştırın
       (Storage sekmesinden veya .env.local indirip)
     - Environment: Production, Preview, Development hepsi işaretli

> **İpucu:** Vercel CLI ile bunu daha kolay yapabilirsiniz:
> ```bash
> vercel env pull .env.production.local
> ```
> İndirdiğiniz dosyada `POSTGRES_PRISMA_URL`'i kopyalayıp `DATABASE_URL` olarak
> aynı dosyaya/panele yapıştırırsınız.

---

## 3) Diğer environment variable'lar

Project → Settings → **Environment Variables** ekranında **production-env.txt**
dosyanızdaki değerleri tek tek girin. Production scope'u işaretli olsun.

**Zorunlu** olanlar:

| Key | Değer |
|---|---|
| `DATABASE_URL` | (yukarıda eklediniz) |
| `NEXTAUTH_URL` | `https://alanadiniz.com` |
| `NEXTAUTH_SECRET` | `production-env.txt`'deki üretilmiş 64 karakter |
| `NEXT_PUBLIC_SITE_URL` | `https://alanadiniz.com` |
| `PAYMENT_PROVIDER` | `stripe` |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | `stripe` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | (7. adımdan sonra ekleyeceğiz, şimdilik geçin) |

**Önerilen** (boşsa o özellik kapalı kalır, hata olmaz):

| Key | Etkisi |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — ürün görseli yükleme. **Kurulumu için 4. adımdaki not** |
| `RESEND_API_KEY`, `RESEND_FROM`, `ORDER_NOTIFICATION_EMAIL` | Sipariş onay e-postası |
| `NEXT_PUBLIC_BUSINESS_*` | Footer ve yasal sayfalardaki şirket bilgileri |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Sağ alttaki WhatsApp butonu |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_SENTRY_DSN` | Hata izleme |

> **Vercel Blob (görsel yükleme):**
> Storage sekmesi → **Create Blob Store** → adı `otodetailing-uploads` →
> Connect Project. Otomatik olarak `BLOB_READ_WRITE_TOKEN` env değişkeni eklenir.
> Aksi takdirde admin panelinde "Görsel Yükle" çalışmaz (Vercel'de filesystem
> read-only).

---

## 4) İlk deploy

1. Project → Deployments → **Redeploy** veya repo'ya yeni bir push
2. Build logu canlı görünür (~2-3 dakika):
   - `node scripts/check-env.mjs` ✓ env'ler doğru
   - `prisma migrate deploy` ✓ tabloları oluşturur (ilk seferinde)
   - `prisma generate` ✓ Prisma Client üretir
   - `next build` ✓ 35 sayfa derlenir
3. **Deployment ready** dedikten sonra Vercel size geçici bir URL verir:
   `otodetailing-xxxxx.vercel.app`
4. Bu URL'de **henüz veri yok** — sıradaki adımlarla yükleyeceğiz

---

## 5) Demo veri + admin (yerelden tek seferlik)

```powershell
# Vercel Postgres connection string'i indir (PRISMA_URL'i)
vercel env pull .env.production.local
# .env.production.local içinden POSTGRES_PRISMA_URL'i kopyala
# Veya dashboard'dan elle al

$env:DATABASE_URL = "postgresql://...neon.tech/...?sslmode=require&pgbouncer=true&connect_timeout=15"

# Demo kategori + ürünler (opsiyonel)
psql $env:DATABASE_URL -f scripts/sql/02-seed.sql

# Admin kullanıcısı — rastgele güçlü şifre üretir
npm run admin:create -- info@alanadiniz.com
```

> Şifreyi terminal çıktısından kopyalayın — bir daha gösterilmez.

> **Not:** Build sırasında `prisma migrate deploy` zaten şemayı kurmuştu;
> 01-schema.sql çalıştırmanıza gerek yok. Sadece seed (02) ve admin için
> komutları kullanın.

`vercel.app` URL'inde `/api/healthcheck` çağırın — `db.ok=true` dönmeli.

---

## 6) Stripe webhook (canlı ödeme için ŞART)

1. <https://dashboard.stripe.com> → **Developers** → **Webhooks**
2. **Add endpoint**:
   - Endpoint URL: `https://alanadiniz.com/api/webhooks/stripe`
     (henüz domain bağlamadıysak `https://otodetailing-xxxxx.vercel.app/api/webhooks/stripe` kullanın, sonra güncellersiniz)
   - Events: `checkout.session.completed`
3. **Add endpoint** → açılan ekranda **Signing secret** (`whsec_...`) kopyalayın
4. Vercel → Project → Settings → Environment Variables:
   - `STRIPE_WEBHOOK_SECRET` = az önce kopyaladığınız `whsec_...`
5. Project → Deployments → **Redeploy** (env değişikliği için yeniden deploy şart)

---

## 7) Domain ekleme (Vercel tarafı)

1. Vercel Project → Settings → **Domains**
2. **Add** → `alanadiniz.com` yazın → Add
3. Açılan ekranda Vercel size DNS kayıtlarını gösterir:

   ```
   A     @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```

   Veya kayıt türleri sağlayıcıya göre değişebilir; Vercel'in size gösterdiği
   tam değerleri kullanın.

4. **www.alanadiniz.com**'u da eklemek isterseniz aynı şekilde "Add" → otomatik
   www → apex redirect kurulur.

---

## 8) Hostinger DNS ayarları

> **Önemli:** Hostinger'da hosting almışsanız bile, sadece **domain** kısmını
> kullanacağız. Hosting'i pasif bırakacağız; sadece DNS Zone Editor'a
> dokunacağız.

1. <https://hpanel.hostinger.com> → giriş yapın
2. **Domains** → alan adınız → **Manage**
3. Sol menü → **DNS / Nameservers**
4. **DNS Zone Editor** sekmesi (eğer Nameservers Hostinger'a aitse)

   > Eğer "Nameservers" sekmesinde Hostinger dışında bir DNS sağlayıcı (örn.
   > Cloudflare) yazıyorsa, kayıtları orada düzenleyin.

5. Mevcut **A** ve **CNAME** kayıtlarını gözden geçirin:

   - Eğer `@ → Hostinger sunucusu IP` varsa → **Edit** → IP'yi `76.76.21.21` yapın
   - Eğer yoksa → **Add Record** → Type: A, Name: `@`, Points to: `76.76.21.21`, TTL: 14400

6. **CNAME** kaydı:
   - Eğer `www → alanadiniz.com` veya benzeri varsa → **Edit** → Points to: `cname.vercel-dns.com`
   - Yoksa → **Add Record** → Type: CNAME, Name: `www`, Points to: `cname.vercel-dns.com`, TTL: 14400

7. **Eski "parking page" / Hostinger anasayfa** A kaydını silin veya değiştirin.

8. DNS propagasyonu **5 dakika - 24 saat** sürebilir. Genelde 10-15 dakika
   içinde aktif olur.

> **Doğrulama:**
> ```powershell
> nslookup alanadiniz.com
> # Address: 76.76.21.21 görmelisiniz
> ```

---

## 9) SSL otomatik aktivasyon

DNS kayıtları doğru olduğu anda Vercel arka planda Let's Encrypt sertifikasını
**otomatik** alır. Vercel Domains ekranında alan adı yanında yeşil tick
çıkana kadar 5-10 dakika bekleyin.

> **HTTP → HTTPS yönlendirme** Vercel'de varsayılan olarak açıktır, ek bir şey
> yapmanız gerekmez.

---

## 10) NEXTAUTH_URL ve SITE_URL'i güncelle

Domain canlıya geldiğinde:

1. Vercel → Project → Settings → Environment Variables
2. `NEXTAUTH_URL` → `https://alanadiniz.com` olduğundan emin olun
3. `NEXT_PUBLIC_SITE_URL` → `https://alanadiniz.com`
4. **Redeploy** (env değişikliği var ise)

Stripe webhook URL'sini de aynı şekilde güncellemeyi unutmayın
(Stripe Dashboard → Webhooks → Edit endpoint).

---

## 11) Ön-uçuş kontrolü (canlıdan)

- [ ] `https://alanadiniz.com/` ana sayfa açılıyor, kategoriler ve ürünler görünüyor
- [ ] `/api/healthcheck` 200 ve `db.ok=true`
- [ ] `/iletisim`, `/sayfa/kvkk`, `/sayfa/mesafeli-satis-sozlesmesi` açılıyor
- [ ] Çerez bildirimi alt köşede çıkıyor
- [ ] Sepete ürün ekleyip mesafeli satış kutucuğu olmadan ödemeye geçilemiyor
- [ ] Stripe test kart `4242 4242 4242 4242` ile ödeme tamamlanıyor (test mode)
- [ ] Webhook event'inden sonra siparişin durumu admin'de `ODENDI` oluyor
- [ ] Müşteriye + yöneticiye onay e-postası gidiyor (Resend yapılandırıldıysa)
- [ ] Admin panelinde ürün görseli yükleyebiliyorsunuz (Vercel Blob aktifse)

---

## 12) Otomatik deploy

Bundan sonra her `git push origin main` Vercel tarafından otomatik build edilip
canlıya alınır. Pull request'ler içinse her commit'te bir **preview deployment**
otomatik üretilir — gerçek production'a dokunmadan değişiklikleri test
edebilirsiniz.

---

## 13) Yönetim ve operasyon

### DB yedek

```powershell
$env:DATABASE_URL = "postgresql://...neon.tech/..."
npm run db:backup    # backups/ altına .sql yazar
```

Vercel Postgres / Neon'da otomatik 7 günlük point-in-time recovery zaten var.

### Şifre değiştirme

`https://alanadiniz.com/admin/giris` → `/admin/hesabim` → "Şifremi değiştir"

### Yeni admin ekleme

```powershell
npm run admin:create -- yeniadmin@alanadiniz.com
```

### Loglar

Vercel Dashboard → Project → **Deployments** → ilgili deployment → **Logs**
sekmesi (canlı tail).

### Sentry (opsiyonel hata izleme)

`NEXT_PUBLIC_SENTRY_DSN` tanımladığınızda runtime hata raporlaması otomatik
aktif olur. Source map upload için ek olarak `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, `SENTRY_PROJECT` gerekir.

---

## Sorun giderme

### "Application error: a server-side exception has occurred"

Vercel → Deployments → ilgili build → **Logs** kısmına bakın.
- En sık sebep: `DATABASE_URL` yanlış veya boş
- İkinci sebep: `NEXTAUTH_SECRET` 32 karakterden kısa

### `prisma migrate deploy` build'de hata veriyor

`POSTGRES_PRISMA_URL` ile `POSTGRES_URL_NON_POOLING` arasında migration için
non-pooling olanı gerekir. `vercel.json`'u şöyle güncelleyin (bizim default'umuz
zaten bu duruma uygun çalışır, ama gerekirse):

```json
{
  "buildCommand": "node scripts/check-env.mjs && DATABASE_URL=$POSTGRES_URL_NON_POOLING prisma migrate deploy && prisma generate && next build"
}
```

### Domain'e gittiğimde "ERR_TOO_MANY_REDIRECTS"

Hostinger'da SSL aktif olabilir ve Vercel ile çakışıyordur. Hostinger panelinde
SSL'i pasif yapın; Vercel kendi sertifikasını yönetsin.

### "DNS_PROBE_FINISHED_NXDOMAIN"

DNS henüz propagate olmamış. 30 dakika bekleyin. Hala olmuyorsa
<https://www.whatsmydns.net/> ile dünya çapında kayıtların görünüp görünmediğine
bakın.

---

## Bu rehbere alternatif: 100% Vercel CLI

Tüm bu adımları terminal'den yapmak isterseniz:

```powershell
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
# (her env için tekrar)
vercel deploy --prod
vercel domains add alanadiniz.com
```

Ama ilk kez yapacaksanız dashboard daha az yanılma payı bırakır.
