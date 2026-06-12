-- =====================================================================
-- Oto Detailing — Demo veri seed scripti (PostgreSQL 14+)
-- =====================================================================
-- Kullanım:
--   psql "$DATABASE_URL" -f scripts/sql/02-seed.sql
--
-- Notlar:
--   * Idempotent: ON CONFLICT (slug) DO NOTHING ile tekrar tekrar
--     çalıştırılabilir, mevcut kayıtları bozmaz.
--   * `prisma/seed.ts` ile birebir aynı kategori ve ürünleri ekler.
--   * Admin kullanıcı için ayrı script: 03-create-admin.sql
--     (üretimde `npm run admin:create -- e-posta` tercih edin).
-- =====================================================================

BEGIN;

-- ----------------------- KATEGORİLER ---------------------------------
INSERT INTO "Category" ("id", "name", "slug", "description", "sortOrder", "updatedAt") VALUES
  ('cat_ic_temizlik',         'İç Temizlik',           'ic-temizlik',         'Koltuk, döşeme ve konsol bakım ürünleri.',     1, NOW()),
  ('cat_dis_yikama',          'Dış Yıkama & Köpük',     'dis-yikama',          'Şampuan, köpük ve ön yıkama ürünleri.',         2, NOW()),
  ('cat_cila_koruma',         'Cila & Koruma',          'cila-koruma',         'Seramik, wax ve yüzey koruyucular.',            3, NOW()),
  ('cat_mikrofiber_aksesuar', 'Mikrofiber & Aksesuar',  'mikrofiber-aksesuar', 'Bezler, aplikatörler ve detay fırçaları.',      4, NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ----------------------- ÜRÜNLER -------------------------------------
-- Not: categoryId değerleri yukarıdaki sabit ID'lere referans verir.
--      Eğer kategoriler farklı ID ile zaten varsa (Prisma cuid),
--      ürün eklemeleri "ON CONFLICT (slug) DO NOTHING" sayesinde atlanır.
INSERT INTO "Product"
  ("id", "name", "slug", "description", "priceCents", "stock", "imageUrl", "active", "categoryId", "updatedAt")
VALUES
  ('p_ph_notr_ic_sprey',
   'pH Nötr İç Detay Spreyi 500ml',
   'ph-notr-ic-detay-spreyi-500ml',
   'Plastik ve vinil yüzeyler için güvenli formül. Mat görünümü korur, yapışkanlık bırakmaz.',
   42900, 48, '/img/1.png', TRUE,
   (SELECT "id" FROM "Category" WHERE "slug" = 'ic-temizlik'),
   NOW()),

  ('p_deri_temizleyici',
   'Deri Temizleyici & Besleyici 250ml',
   'deri-temizleyici-besleyici-250ml',
   'Deri koltuklar için iki aşamalı bakım: temizlik + esneklik.',
   38900, 32, '/img/2.png', TRUE,
   (SELECT "id" FROM "Category" WHERE "slug" = 'ic-temizlik'),
   NOW()),

  ('p_kopuk_sampuan',
   'Köpük Şampuan Konsantre 1L',
   'kopuk-sampuan-konsantre-1l',
   'Yüksek kayma gücü, cilaya zarar vermeyen aktif yüzeyler.',
   34900, 60, '/img/3.png', TRUE,
   (SELECT "id" FROM "Category" WHERE "slug" = 'dis-yikama'),
   NOW()),

  ('p_demir_tozu_giderici',
   'Demir Tozu Giderici 500ml',
   'demir-tozu-giderici-500ml',
   'Jant ve boyalı yüzeylerde demir partiküllerini çözer, güvenli kullanım.',
   45900, 22, '/img/4.png', TRUE,
   (SELECT "id" FROM "Category" WHERE "slug" = 'dis-yikama'),
   NOW()),

  ('p_seramik_hizli_cila',
   'Seramik Hızlı Cila 500ml',
   'seramik-hizli-cila-500ml',
   '6 ay koruma hedefi, ekstrem su iticiliği ve parlaklık.',
   89900, 18, '/img/5.png', TRUE,
   (SELECT "id" FROM "Category" WHERE "slug" = 'cila-koruma'),
   NOW())
ON CONFLICT ("slug") DO NOTHING;

COMMIT;

-- Sonuç özeti
SELECT
  (SELECT COUNT(*) FROM "Category") AS category_count,
  (SELECT COUNT(*) FROM "Product")  AS product_count;
