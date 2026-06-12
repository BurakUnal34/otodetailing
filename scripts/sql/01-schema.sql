-- =====================================================================
-- Oto Detailing — Şema kurulum scripti (PostgreSQL 14+)
-- =====================================================================
-- Kullanım:
--   psql "$DATABASE_URL" -f scripts/sql/01-schema.sql
--
-- Notlar:
--   * Idempotent: tekrar tekrar çalıştırılabilir, mevcut yapıyı bozmaz.
--   * `prisma migrate deploy` ile ürettiği şemayla 1:1 aynıdır.
--   * Sadece şema oluşturur, veri eklemez. Veri için 02-seed.sql.
-- =====================================================================

BEGIN;

-- ----------------------- ENUM: OrderStatus ---------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
    CREATE TYPE "OrderStatus" AS ENUM ('BEKLEMEDE', 'ODENDI', 'IPTAL');
  END IF;
END$$;

-- ----------------------- TABLO: AdminUser ----------------------------
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id"           TEXT         NOT NULL,
  "email"        TEXT         NOT NULL,
  "passwordHash" TEXT         NOT NULL,
  "name"         TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key"
  ON "AdminUser" ("email");

-- ----------------------- TABLO: Category -----------------------------
CREATE TABLE IF NOT EXISTS "Category" (
  "id"          TEXT         NOT NULL,
  "name"        TEXT         NOT NULL,
  "slug"        TEXT         NOT NULL,
  "description" TEXT,
  "sortOrder"   INTEGER      NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key"
  ON "Category" ("slug");

-- ----------------------- TABLO: Product ------------------------------
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT         NOT NULL,
  "name"        TEXT         NOT NULL,
  "slug"        TEXT         NOT NULL,
  "description" TEXT         NOT NULL,
  "priceCents"  INTEGER      NOT NULL,
  "stock"       INTEGER      NOT NULL DEFAULT 0,
  "imageUrl"    TEXT,
  "active"      BOOLEAN      NOT NULL DEFAULT TRUE,
  "categoryId"  TEXT         NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key"
  ON "Product" ("slug");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx"
  ON "Product" ("categoryId");
CREATE INDEX IF NOT EXISTS "Product_slug_idx"
  ON "Product" ("slug");

-- Product → Category foreign key (yalnızca yoksa ekle)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Product_categoryId_fkey'
  ) THEN
    ALTER TABLE "Product"
      ADD CONSTRAINT "Product_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

-- ----------------------- TABLO: Order --------------------------------
CREATE TABLE IF NOT EXISTS "Order" (
  "id"              TEXT          NOT NULL,
  "status"          "OrderStatus" NOT NULL DEFAULT 'BEKLEMEDE',
  "totalCents"      INTEGER       NOT NULL,
  "customerEmail"   TEXT          NOT NULL,
  "customerName"    TEXT          NOT NULL,
  "customerPhone"   TEXT,
  "shippingAddress" TEXT,
  "stripeSessionId" TEXT,
  "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key"
  ON "Order" ("stripeSessionId");
CREATE INDEX IF NOT EXISTS "Order_status_idx"
  ON "Order" ("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx"
  ON "Order" ("createdAt");

-- ----------------------- TABLO: OrderItem ----------------------------
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"              TEXT    NOT NULL,
  "orderId"         TEXT    NOT NULL,
  "productId"       TEXT    NOT NULL,
  "quantity"        INTEGER NOT NULL,
  "unitPriceCents"  INTEGER NOT NULL,
  "productNameSnap" TEXT    NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx"
  ON "OrderItem" ("orderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_orderId_fkey'
  ) THEN
    ALTER TABLE "OrderItem"
      ADD CONSTRAINT "OrderItem_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_productId_fkey'
  ) THEN
    ALTER TABLE "OrderItem"
      ADD CONSTRAINT "OrderItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

COMMIT;

-- Sonuç özeti
SELECT
  (SELECT COUNT(*) FROM "AdminUser") AS admin_user_count,
  (SELECT COUNT(*) FROM "Category")  AS category_count,
  (SELECT COUNT(*) FROM "Product")   AS product_count,
  (SELECT COUNT(*) FROM "Order")     AS order_count,
  (SELECT COUNT(*) FROM "OrderItem") AS order_item_count;
