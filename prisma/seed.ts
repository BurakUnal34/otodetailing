import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@otodetailing.local" },
    update: { passwordHash },
    create: {
      email: "admin@otodetailing.local",
      passwordHash,
      name: "Yönetici",
    },
  });

  const categories = [
    {
      name: "İç Temizlik",
      slug: "ic-temizlik",
      description: "Koltuk, döşeme ve konsol bakım ürünleri.",
      sortOrder: 1,
    },
    {
      name: "Dış Yıkama & Köpük",
      slug: "dis-yikama",
      description: "Şampuan, köpük ve ön yıkama ürünleri.",
      sortOrder: 2,
    },
    {
      name: "Cila & Koruma",
      slug: "cila-koruma",
      description: "Seramik, wax ve yüzey koruyucular.",
      sortOrder: 3,
    },
    {
      name: "Mikrofiber & Aksesuar",
      slug: "mikrofiber-aksesuar",
      description: "Bezler, aplikatörler ve detay fırçaları.",
      sortOrder: 4,
    },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      create: c,
    });
  }

  const ic = await prisma.category.findUniqueOrThrow({ where: { slug: "ic-temizlik" } });
  const dis = await prisma.category.findUniqueOrThrow({ where: { slug: "dis-yikama" } });
  const cila = await prisma.category.findUniqueOrThrow({ where: { slug: "cila-koruma" } });

  const products = [
    {
      name: "pH Nötr İç Detay Spreyi 500ml",
      slug: "ph-notr-ic-detay-spreyi-500ml",
      description:
        "Plastik ve vinil yüzeyler için güvenli formül. Mat görünümü korur, yapışkanlık bırakmaz.",
      priceCents: 429_00,
      stock: 48,
      imageUrl: "https://placehold.co/600x600/18181b/fbbf24/png?text=Ic+1",
      categoryId: ic.id,
    },
    {
      name: "Deri Temizleyici & Besleyici 250ml",
      slug: "deri-temizleyici-besleyici-250ml",
      description: "Deri koltuklar için iki aşamalı bakım: temizlik + esneklik.",
      priceCents: 389_00,
      stock: 32,
      imageUrl: "https://placehold.co/600x600/18181b/fbbf24/png?text=Ic+2",
      categoryId: ic.id,
    },
    {
      name: "Köpük Şampuan Konsantre 1L",
      slug: "kopuk-sampuan-konsantre-1l",
      description: "Yüksek kayma gücü, cilaya zarar vermeyen aktif yüzeyler.",
      priceCents: 349_00,
      stock: 60,
      imageUrl: "https://placehold.co/600x600/18181b/fbbf24/png?text=Dis+1",
      categoryId: dis.id,
    },
    {
      name: "Demir Tozu Giderici 500ml",
      slug: "demir-tozu-giderici-500ml",
      description: "Jant ve boyalı yüzeylerde demir partiküllerini çözer, güvenli kullanım.",
      priceCents: 459_00,
      stock: 22,
      imageUrl: "https://placehold.co/600x600/18181b/fbbf24/png?text=Dis+2",
      categoryId: dis.id,
    },
    {
      name: "Seramik Hızlı Cila 500ml",
      slug: "seramik-hizli-cila-500ml",
      description: "6 ay koruma hedefi, ekstrem su iticiliği ve parlaklık.",
      priceCents: 899_00,
      stock: 18,
      imageUrl: "https://placehold.co/600x600/18181b/fbbf24/png?text=Cila",
      categoryId: cila.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        active: true,
      },
      create: { ...p, active: true },
    });
  }

  console.log("Seed tamam: admin@otodetailing.local / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
