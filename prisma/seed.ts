import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

const DEFAULT_DEV_EMAIL = "admin@otodetailing.local";
const DEFAULT_DEV_PASSWORD = "admin123";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function getInitialAdminCredentials(): { email: string; password: string; generated: boolean } {
  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  if (IS_PRODUCTION) {
    if (
      !envEmail ||
      !envPassword ||
      envPassword === DEFAULT_DEV_PASSWORD ||
      envEmail === DEFAULT_DEV_EMAIL
    ) {
      const email = envEmail && envEmail !== DEFAULT_DEV_EMAIL ? envEmail : `admin@${new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").hostname}`;
      const password = crypto.randomBytes(18).toString("base64url");
      return { email, password, generated: true };
    }
    return { email: envEmail, password: envPassword, generated: false };
  }

  return {
    email: envEmail || DEFAULT_DEV_EMAIL,
    password: envPassword || DEFAULT_DEV_PASSWORD,
    generated: false,
  };
}

async function ensureFirstAdmin() {
  const count = await prisma.adminUser.count();
  if (count > 0) {
    console.log("[seed] AdminUser zaten mevcut, oluşturma atlandı.");
    return;
  }

  const { email, password, generated } = getInitialAdminCredentials();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name: "Yönetici" },
  });

  if (generated) {
    console.log("\n──────────────────────────────────────────────────────────");
    console.log("[seed] PRODUCTION: yeni admin oluşturuldu.");
    console.log(`        e-posta : ${email}`);
    console.log(`        şifre   : ${password}`);
    console.log("        Bu şifre yeniden gösterilmez. Hemen /admin/giris üzerinden");
    console.log("        giriş yapıp /admin/hesabim üzerinden değiştirin.");
    console.log("──────────────────────────────────────────────────────────\n");
  } else {
    console.log(`[seed] Admin oluşturuldu: ${email}`);
    if (!IS_PRODUCTION) {
      console.log(`[seed] (dev) şifre: ${password}`);
    }
  }
}

async function ensureCategoriesAndDemoProducts() {
  const categoryCount = await prisma.category.count();
  if (categoryCount > 0) {
    console.log("[seed] Kategoriler mevcut, demo veri atlandı.");
    return;
  }
  if (IS_PRODUCTION) {
    console.log("[seed] PRODUCTION: kategoriler boş, demo ürünler eklenmeyecek. Yönetim panelinden eklemeniz gerekir.");
    return;
  }

  const categories = [
    { name: "İç Temizlik", slug: "ic-temizlik", description: "Koltuk, döşeme ve konsol bakım ürünleri.", sortOrder: 1 },
    { name: "Dış Yıkama & Köpük", slug: "dis-yikama", description: "Şampuan, köpük ve ön yıkama ürünleri.", sortOrder: 2 },
    { name: "Cila & Koruma", slug: "cila-koruma", description: "Seramik, wax ve yüzey koruyucular.", sortOrder: 3 },
    { name: "Mikrofiber & Aksesuar", slug: "mikrofiber-aksesuar", description: "Bezler, aplikatörler ve detay fırçaları.", sortOrder: 4 },
  ];

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }

  const ic = await prisma.category.findUniqueOrThrow({ where: { slug: "ic-temizlik" } });
  const dis = await prisma.category.findUniqueOrThrow({ where: { slug: "dis-yikama" } });
  const cila = await prisma.category.findUniqueOrThrow({ where: { slug: "cila-koruma" } });

  /**
   * Demo ürünler: imageUrl olarak kullanıcının `public/img/` görsellerini gösterir.
   * Üretime almadan önce gerçek ürün görsellerinizi yönetim panelinden yükleyin
   * ve admin panelinden bu görselleri değiştirin.
   */
  const products = [
    {
      name: "pH Nötr İç Detay Spreyi 500ml",
      slug: "ph-notr-ic-detay-spreyi-500ml",
      description:
        "Plastik ve vinil yüzeyler için güvenli formül. Mat görünümü korur, yapışkanlık bırakmaz.",
      priceCents: 429_00,
      stock: 48,
      imageUrl: "/img/1.png",
      categoryId: ic.id,
    },
    {
      name: "Deri Temizleyici & Besleyici 250ml",
      slug: "deri-temizleyici-besleyici-250ml",
      description: "Deri koltuklar için iki aşamalı bakım: temizlik + esneklik.",
      priceCents: 389_00,
      stock: 32,
      imageUrl: "/img/2.png",
      categoryId: ic.id,
    },
    {
      name: "Köpük Şampuan Konsantre 1L",
      slug: "kopuk-sampuan-konsantre-1l",
      description: "Yüksek kayma gücü, cilaya zarar vermeyen aktif yüzeyler.",
      priceCents: 349_00,
      stock: 60,
      imageUrl: "/img/3.png",
      categoryId: dis.id,
    },
    {
      name: "Demir Tozu Giderici 500ml",
      slug: "demir-tozu-giderici-500ml",
      description: "Jant ve boyalı yüzeylerde demir partiküllerini çözer, güvenli kullanım.",
      priceCents: 459_00,
      stock: 22,
      imageUrl: "/img/4.png",
      categoryId: dis.id,
    },
    {
      name: "Seramik Hızlı Cila 500ml",
      slug: "seramik-hizli-cila-500ml",
      description: "6 ay koruma hedefi, ekstrem su iticiliği ve parlaklık.",
      priceCents: 899_00,
      stock: 18,
      imageUrl: "/img/5.png",
      categoryId: cila.id,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: { ...p, active: true } });
  }
  console.log("[seed] Demo kategori ve ürünler eklendi.");
}

async function main() {
  await ensureFirstAdmin();
  await ensureCategoriesAndDemoProducts();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
