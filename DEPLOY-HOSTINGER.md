# Hostinger üzerinde canlıya çıkış rehberi

Bu Next.js 15 projesi Hostinger **Web Hosting (Business / Cloud)** paketlerinde
Node.js feature'ı kullanılarak canlıya çıkarılır. Veritabanı için Hostinger
yalnız MySQL veriyor; biz **harici Neon PostgreSQL** (ücretsiz tier) kullanacağız
çünkü proje Postgres üzerine yazılı.

> **Önkoşul kontrolü:** hPanel → Advanced kısmında **"Node.js"** seçeneği
> görüyor musunuz? Görmüyorsanız paketinizin Node.js desteği yok demektir;
> Business veya Cloud planına yükseltmeniz gerekir.

---

## 0) Genel akış (önce yol haritası)

```
[1] Neon'da ücretsiz Postgres aç → DATABASE_URL al
[2] DB'ye şemayı yükle (psql veya Neon SQL Editor)
[3] Yerelde standalone build üret (npm run build:hostinger)
[4] FileZilla ile dosyaları Hostinger'a yükle
[5] hPanel → Advanced → Node.js → Application kur
[6] Environment variables ekle
[7] Domain'i Node.js app'e bağla, SSL aç
[8] Restart → site canlıda
```

Toplam tahmini süre: **45–60 dakika** (ilk kez yapıyorsanız).

---

## 1) Neon Postgres veritabanı (ücretsiz)

1. <https://neon.tech> → "Sign up" (GitHub veya Google ile, 30 saniye)
2. **Create project**:
   - Project name: `otodetailing`
   - Postgres version: **16**
   - Region: en yakın Avrupa (örn. `Frankfurt` veya `Stockholm`)
3. Açılan ekranda **Connection string** kısmını kopyalayın. Şuna benzer:

   ```
   postgresql://USER:PASSWORD@ep-xxx-yyy.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   > Bunu güvenli bir yere kaydedin — birazdan `DATABASE_URL` olarak kullanacağız.

4. **Şemayı yükleyin.** İki yol var:

   **A) Neon SQL Editor (en kolay):**
   - Sol menü → **SQL Editor**
   - Bu projedeki `scripts/sql/01-schema.sql` dosyasının tüm içeriğini yapıştırın → Run
   - Aynı şekilde `scripts/sql/02-seed.sql` ile demo ürünleri yükleyin (opsiyonel)

   **B) Yerelden psql ile:**
   ```powershell
   $env:DATABASE_URL = "postgresql://USER:PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require"
   psql $env:DATABASE_URL -f scripts/sql/01-schema.sql
   psql $env:DATABASE_URL -f scripts/sql/02-seed.sql
   ```

5. **Admin kullanıcı oluşturun:**
   ```powershell
   $env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
   npm run admin:create -- info@alanadiniz.com
   ```
   Terminale yazılan **rastgele güçlü şifreyi** kopyalayın — bir daha gösterilmez.

---

## 2) Yerelde production paketini hazırlayın

Yerelinizde temiz bir build alın. Bu, Hostinger'ın CPU / RAM limitleri içinde
build çalıştırmak yerine hazır paketi yüklememizi sağlar.

```powershell
# Bağımlılıklar (zaten kurulu olmalı)
npm ci

# Standalone production build + asset kopyalama
npm run build:hostinger
```

Çıktılar:

```
.next/standalone/         ← Tüm uygulama burada (~128 MB)
  ├── server.js           ← Next.js'in self-contained sunucusu
  ├── package.json
  ├── node_modules/       ← Yalnız production bağımlılıkları
  ├── .next/static/       ← (script tarafından kopyalandı)
  └── public/             ← (script tarafından kopyalandı)
app.js                    ← Hostinger Passenger entry point
```

> **Yükleyeceğimiz dosyalar bunlar:** `.next/standalone/` klasörünün tüm içeriği +
> proje kökündeki `app.js`. Başka hiçbir şey gerekmez.

---

## 3) Hostinger'da Node.js uygulaması oluşturun

1. **hPanel** → sol menü → **Advanced** → **Node.js**
2. **Create Application** butonu:
   - **Node.js version**: `20.x` (en yeni LTS)
   - **Application mode**: `Production`
   - **Application root**: `domains/alanadiniz.com/public_html`
     (alan adınıza göre değişir; domain klasörünü seçin)
   - **Application URL**: `alanadiniz.com` (domaininizi seçin)
   - **Application startup file**: `app.js`
   - **Passenger log file**: (boş bırakın, varsayılan)
3. **Create** → uygulama oluşturulur ve "Stopped" durumda görünür.

> Henüz başlatmayın; önce dosyaları ve env değişkenlerini ekleyeceğiz.

---

## 4) Dosyaları FileZilla ile yükleyin

### Hostinger SFTP bilgileri

hPanel → **Files** → **FTP Accounts** veya **SSH Access** kısmında:

- Host: `ftp.alanadiniz.com` veya hPanel'de yazan SFTP host
- Port: `22` (SFTP) veya `21` (FTP) — tercihen **SFTP**
- Username: hPanel'de yazan
- Password: hPanel'de yazan (veya yeni oluşturun)

### FileZilla'da yapılacaklar

1. **File → Site Manager → New Site**
   - Protocol: **SFTP** (eğer SSH yetkili paketse) veya **FTP**
   - Host / Port / User / Password yukarıdaki bilgilerle
   - Connect

2. Sağ tarafta (uzak sunucu) **uygulama kök dizinine** girin:

   ```
   /home/u123456789/domains/alanadiniz.com/public_html/
   ```

3. **Sol tarafta (yerel makineniz) projenin köküne** gidin:
   `c:\Users\burak\Desktop\otodetailing\`

4. Şu dosya/klasörleri **uzak sunucudaki uygulama köküne** sürükleyin:

   | Yerel | Uzak (uygulama kökü) |
   |---|---|
   | `app.js` | `app.js` |
   | `.next/standalone/server.js` | `server.js` |
   | `.next/standalone/package.json` | `package.json` |
   | `.next/standalone/node_modules/` | `node_modules/` |
   | `.next/standalone/.next/` | `.next/` |
   | `.next/standalone/public/` | `public/` |

   > Yükleme süresi ~10-30 dakika sürebilir (node_modules bol dosya içerir).
   > FileZilla → Transfer → "Maximum simultaneous transfers" değerini 4-8 yapın,
   > daha hızlı olur.

   > **Üst seviyedeki `.next/standalone/` klasörünün İÇİNDEKİLERİ** yüklüyoruz,
   > klasörün kendisini değil. Yani `public_html/server.js` olmalı,
   > `public_html/standalone/server.js` değil.

5. Yüklemeden **hariç tutun** (gerek yok):
   - `.git/`, `node_modules/` (kökteki, dev modules), `src/`, `prisma/`, `.next/cache/`
   - `docker-compose.yml`, `tsconfig.json`, `next.config.ts` vb. dev dosyaları
   - `.env`, `.env.local`, `production-env.txt` (env'leri panelden gireceğiz)

---

## 5) Environment variables (hPanel'den)

hPanel → Advanced → Node.js → uygulamanızı seçin → **Add variable** ile teker
teker ekleyin. Aşağıdakiler **zorunlu**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://USER:PASS@ep-xxx.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | `https://alanadiniz.com` |
| `NEXTAUTH_SECRET` | `production-env.txt`'deki üretilmiş 64 karakterli değer (veya `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | `https://alanadiniz.com` |
| `PAYMENT_PROVIDER` | `stripe` |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | `stripe` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (6. adımdan sonra) |

**Önerilen** (boşsa özellik kapalı kalır):

| Key | Etkisi |
|---|---|
| `RESEND_API_KEY`, `RESEND_FROM`, `ORDER_NOTIFICATION_EMAIL` | Sipariş onay e-postası |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — Hostinger ile uyumsuz, **boş bırakın**. Bunun yerine 7. adımdaki dipnota bakın. |
| `NEXT_PUBLIC_BUSINESS_*` | Footer ve yasal sayfalardaki şirket bilgileri |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Sağ alttaki WhatsApp butonu |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_SENTRY_DSN` | Hata izleme |

Tüm değişkenleri ekledikten sonra **Save**.

---

## 6) Uygulamayı başlatın

hPanel → Advanced → Node.js → uygulamanız → **Start application**

- Status `Started` olmalı.
- "Open" butonu / domain üzerinden açın.
- Açılmazsa **logs** kısmına bakın (uygulama detayında "Logs" sekmesi).

### Sağlık kontrolü

```
https://alanadiniz.com/api/healthcheck
```

Şuna benzer dönmeli:

```json
{ "ok": true, "status": "healthy", "db": { "ok": true, "latencyMs": 23 } }
```

---

## 7) Stripe webhook (canlı ödeme için ŞART)

Stripe Dashboard → Developers → Webhooks → **Add endpoint**:

- URL: `https://alanadiniz.com/api/webhooks/stripe`
- Event: `checkout.session.completed`

Açılan **Signing secret**'ı (`whsec_...`) hPanel → Node.js → Environment
Variables'a `STRIPE_WEBHOOK_SECRET` olarak ekleyin → **Restart application**.

> **Görsel yükleme — Hostinger'da otomatik çalışır:**
> `BLOB_READ_WRITE_TOKEN` env'ini **boş bırakırsanız** (veya hiç eklemezseniz),
> upload endpoint'i otomatik olarak Hostinger'ın disk'ine yazar:
> `public/uploads/products/` klasörüne `.webp` formatında (sharp ile yeniden boyutlandırılmış).
>
> İlk yüklemede uygulama kök dizini içinde `public/uploads/products/` klasörü
> otomatik oluşturulur. SFTP'ye gerek yok; admin panelinden "Görsel yükle"
> butonuyla doğrudan kullanın.
>
> **Kalıcılık garantisi:** `scripts/copy-standalone-assets.mjs` her build'de
> `public/uploads/` klasörünü pakete dahil **etmez**, dolayısıyla yeniden
> deploy ederken kullanıcı görselleri ezilmez. (Bkz. 10. adım.)
>
> Yine de daha ölçeklenebilir bir CDN istiyorsanız (Cloudinary / AWS S3),
> `src/app/api/admin/upload-image/route.ts` içindeki `BLOB_READ_WRITE_TOKEN`
> şartını ilgili sağlayıcının SDK çağrısıyla değiştirebiliriz.

---

## 8) Domain ve SSL

### Domain bağlama

Hostinger'da Node.js app oluştururken zaten domain seçtik. Ama emin olmak için:

1. hPanel → Domains → alanadiniz.com → **Manage**
2. **Document root** → Node.js uygulamasının kökü olmalı (genelde otomatik ayarlanır)

### SSL (HTTPS)

1. hPanel → Advanced → **SSL** veya **Security** → SSL Certificates
2. **Install free SSL** (Let's Encrypt) → alanadiniz.com için → Install
3. **Force HTTPS** seçeneğini açın
4. 5 dakika içinde aktif olur

> **Önemli:** SSL aktif olduktan sonra `NEXTAUTH_URL` ve `NEXT_PUBLIC_SITE_URL`
> değerlerinin `https://` ile başladığından emin olun, gerekirse env'leri
> güncelleyip uygulamayı **restart** edin.

---

## 9) Ön-uçuş kontrolü (canlıdan)

Aşağıdaki maddelerin hepsini doğrulayın:

- [ ] `https://alanadiniz.com/` açılıyor, ana sayfa yükleniyor
- [ ] `/api/healthcheck` 200 ve `db.ok=true`
- [ ] `/iletisim`, `/sayfa/kvkk`, `/sayfa/mesafeli-satis-sozlesmesi` açılıyor
- [ ] Sağ altta WhatsApp butonu görünüyor (telefon yapılandırılmışsa)
- [ ] Çerez bildirimi alt köşede çıkıyor, "Tümünü kabul" tıklanınca kayboluyor
- [ ] Sepete ürün ekleyip, mesafeli satış kutucuğu olmadan ödemeye geçilemiyor
- [ ] Stripe test kart `4242 4242 4242 4242` ile (test mode'da) ödeme tamam
- [ ] Stripe webhook gelen event'ten sonra siparişin durumu admin'de `ODENDI` olmuş
- [ ] Müşteriye + yöneticiye onay e-postası gidiyor (Resend yapılandırıldıysa)
- [ ] Admin panelinde sipariş ve düşmüş stok görünüyor

---

## 10) Operasyon — değişiklik yayınlama (sonraki güncellemeler)

Kodda değişiklik yaptığınızda:

```powershell
# Yerelde
npm run build:hostinger
```

Sonra **FileZilla ile yalnızca değişen klasörleri** yeniden yükleyin:
- `.next/standalone/.next/` → `.next/`
- (büyük değişiklik varsa) `.next/standalone/server.js` → `server.js`

> `node_modules/` klasörünü her seferinde yüklemenize **gerek yok** — sadece
> yeni bir paket eklediyseniz veya silip ekledikten sonra.
>
> **Kullanıcı yüklediği ürün görselleri:** `public/uploads/products/` klasörü
> Hostinger'da KORUNUR çünkü `copy-standalone-assets.mjs` bu klasörü pakete
> dahil etmez. FileZilla ile `public/` klasörünü yüklerken **uploads** alt
> klasörünü "skip" yapın (FileZilla → Transfer → "Upload" yerine "Skip" deyin
> dosya çakışmasında). En güvenlisi: `public/` yerine sadece değişen statik
> dosyaları yükleyin.

Son olarak hPanel → Node.js → uygulamanız → **Restart application**.

---

## 11) Yedekleme

### Veritabanı

Neon'da otomatik 7 günlük point-in-time recovery var (ücretsiz tier). Manuel
yedek için:

```powershell
$env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
npm run db:backup    # backups/ altına .sql yazar
```

### Dosya / kod

Kaynak kod GitHub'da olduğu için ek yedekleme gerekmez. Kullanıcı yüklediği
ürün görsellerini periyodik olarak FileZilla ile indirin (`public/uploads/`).

---

## 12) Sorun giderme

### "Application failed to start" / 503 Service Unavailable

- hPanel → Node.js → uygulamanız → **Logs**'a bakın
- En sık sebepler:
  1. `DATABASE_URL` yanlış / Neon'a erişilemiyor (Neon dashboard'dan IP allow list kontrol edin — varsayılan açık)
  2. `NEXTAUTH_SECRET` 32 karakterden kısa
  3. `app.js` veya `server.js` bulunamıyor — dosya yolları yanlış
  4. Node.js sürümü 20.x değil → değiştirip restart

### Healthcheck `db.ok: false`

- Neon dashboard'dan veritabanının "Active" olduğundan emin olun
- Connection string'de `?sslmode=require` parametresinin olduğunu kontrol edin
- Free tier 5 dakika inaktif kalınca uyur, ilk istek 1-2 saniye yavaş olur — normal

### "ECONNREFUSED 127.0.0.1:5432"

`DATABASE_URL` env değişkeni atanmamış demektir. hPanel → Node.js → Environment
Variables kısmını kontrol edin, restart edin.

### Türkçe karakter / emoji bozulması

Hostinger MySQL'i (varsa) `utf8mb4` olmalı. Biz Neon Postgres kullandığımız
için bu sorun yaşanmıyor; UTF-8 default.

---

## Yardım

Bu rehbere rağmen takıldığınız adım olursa, hatanın **tam ekran görüntüsü** +
hPanel → Node.js → Logs çıktısını paylaşın.
