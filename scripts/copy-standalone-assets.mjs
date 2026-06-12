#!/usr/bin/env node
/**
 * Next.js `output: "standalone"` ayarı `.next/standalone/server.js` üretir
 * ama `.next/static/` ve `public/` klasörlerini kopyalamaz; bunları
 * elle koymak gerekir. Bu script, Hostinger / VPS deploy paketini
 * eksiksiz hazırlamak için her ikisini de standalone klasörüne kopyalar.
 *
 * Çıktı klasörü:
 *   .next/standalone/
 *     ├── server.js
 *     ├── package.json
 *     ├── node_modules/        (yalnız production bağımlılıkları)
 *     ├── .next/
 *     │   └── static/          ← buraya kopyalanır
 *     └── public/              ← buraya kopyalanır
 *
 * Bu klasörün TAMAMINI Hostinger'a yükleyebilirsiniz; diğer hiçbir şey
 * (kaynak kod, prisma/, vs.) gerekmez. Tek bağlantılı dosya olarak
 * üst seviyedeki `app.js` da yüklenmelidir (Passenger entry point).
 */

import { cp, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const standaloneDir = resolve(root, ".next/standalone");
const staticSrc = resolve(root, ".next/static");
const publicSrc = resolve(root, "public");
const staticDest = resolve(standaloneDir, ".next/static");
const publicDest = resolve(standaloneDir, "public");

async function ensureExists(p, label) {
  if (!existsSync(p)) {
    console.error(`[copy-standalone-assets] ${label} bulunamadı: ${p}`);
    console.error("  Önce `npm run build` çalıştırın (output: 'standalone' ile).");
    process.exit(1);
  }
  const s = await stat(p);
  if (!s.isDirectory()) {
    console.error(`[copy-standalone-assets] ${label} bir klasör değil: ${p}`);
    process.exit(1);
  }
}

await ensureExists(standaloneDir, ".next/standalone");
await ensureExists(staticSrc, ".next/static");

await mkdir(dirname(staticDest), { recursive: true });
await cp(staticSrc, staticDest, { recursive: true });
console.log(`[copy-standalone-assets] .next/static → ${staticDest}`);

if (existsSync(publicSrc)) {
  /** Önemli: public/uploads/ kullanıcının yüklediği ürün görsellerini barındırır.
   *  Yeniden deploy'da bunları ezmemek için filter kullanıyoruz; uploads klasörü
   *  hiçbir zaman pakete dahil edilmez. */
  await cp(publicSrc, publicDest, {
    recursive: true,
    filter: (src) => {
      const rel = src.slice(publicSrc.length).replace(/\\/g, "/");
      return !rel.startsWith("/uploads");
    },
  });
  console.log(`[copy-standalone-assets] public/ → ${publicDest} (uploads/ hariç)`);
} else {
  console.warn("[copy-standalone-assets] public/ yok, kopyalama atlandı.");
}

console.log("[copy-standalone-assets] Tamamlandı. .next/standalone/ klasörünü FileZilla ile yükleyebilirsiniz.");
