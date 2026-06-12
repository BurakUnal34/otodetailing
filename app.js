/**
 * Hostinger Node.js (Phusion Passenger) için giriş noktası.
 *
 * Hostinger hPanel → Advanced → Node.js bölümünde, "Application startup file"
 * alanına bu dosyanın adı (`app.js`) yazılır. Passenger bu dosyayı çalıştırır
 * ve PORT değerini `process.env.PORT` üzerinden gönderir.
 *
 * Bu dosya yalnızca Next.js'in standalone build çıktısındaki sunucuyu başlatır.
 * Production öncesi yerel makinede `npm run build:hostinger` çalıştırın;
 * `.next/standalone/server.js` üretilir ve aşağıda require edilir.
 */
const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

/** Standalone server.js, kendi içinde createServer çağırır ve PORT üzerinde dinler. */
require(path.resolve(__dirname, ".next/standalone/server.js"));
