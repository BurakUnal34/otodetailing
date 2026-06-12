-- =====================================================================
-- Oto Detailing — Veritabanını TAMAMEN SIFIRLA (DİKKAT — VERİ KAYBI)
-- =====================================================================
-- Kullanım:
--   psql "$DATABASE_URL" -f scripts/sql/99-reset.sql
--
-- Bu script aşağıdaki HER ŞEYİ siler:
--   * Tablolar: OrderItem, Order, Product, Category, AdminUser, _prisma_migrations
--   * Enum: "OrderStatus"
-- Sonrasında 01-schema.sql ile yeniden kurun.
-- =====================================================================

BEGIN;

DROP TABLE IF EXISTS "OrderItem"           CASCADE;
DROP TABLE IF EXISTS "Order"               CASCADE;
DROP TABLE IF EXISTS "Product"             CASCADE;
DROP TABLE IF EXISTS "Category"            CASCADE;
DROP TABLE IF EXISTS "AdminUser"           CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations"  CASCADE;

DROP TYPE IF EXISTS "OrderStatus";

COMMIT;

SELECT 'reset complete' AS status;
