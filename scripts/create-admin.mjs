#!/usr/bin/env node
/**
 * Tek seferlik admin oluşturma / şifre sıfırlama scripti.
 *
 * Kullanım:
 *   node scripts/create-admin.mjs                              # ADMIN_EMAIL/ADMIN_PASSWORD env'den okur
 *   node scripts/create-admin.mjs admin@alanadiniz.com         # şifre rastgele üretilir
 *   node scripts/create-admin.mjs admin@alanadiniz.com gizli   # belirtilen şifre kullanılır
 *
 * Aynı e-posta zaten varsa şifresi GÜNCELLENİR (reset). Yoksa yeni admin oluşturulur.
 *
 * Production'da seed çalıştırmak yerine bu daha güvenlidir; seed demo ürünleri ve
 * default değerler ile uğraşmaz, yalnızca admin'i halleder.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const argEmail = process.argv[2];
const argPassword = process.argv[3];

const email = (argEmail ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
if (!email) {
  console.error("[create-admin] Hata: e-posta verilmedi (argüman veya ADMIN_EMAIL env).");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("[create-admin] Hata: geçersiz e-posta:", email);
  process.exit(1);
}

const supplied = (argPassword ?? process.env.ADMIN_PASSWORD ?? "").trim();
const generated = !supplied;
const password = supplied || crypto.randomBytes(18).toString("base64url");

if (password.length < 10) {
  console.error("[create-admin] Hata: şifre en az 10 karakter olmalı.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const existing = await prisma.adminUser.findUnique({ where: { email } });
const user = existing
  ? await prisma.adminUser.update({ where: { email }, data: { passwordHash } })
  : await prisma.adminUser.create({ data: { email, passwordHash, name: "Yönetici" } });

const banner = "─".repeat(64);
console.log(`\n${banner}`);
console.log(existing ? "[create-admin] Mevcut admin şifresi sıfırlandı:" : "[create-admin] Yeni admin oluşturuldu:");
console.log(`        e-posta : ${user.email}`);
if (generated) {
  console.log(`        şifre   : ${password}`);
  console.log("        Bu şifre yeniden gösterilmez. Hemen /admin/giris üzerinden giriş yapıp");
  console.log("        /admin/hesabim üzerinden değiştirin.");
} else {
  console.log("        şifre   : (env'den / argümandan okundu)");
}
console.log(`${banner}\n`);

await prisma.$disconnect();
