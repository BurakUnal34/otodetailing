-- =====================================================================
-- Oto Detailing — İlk admin kullanıcısı (örnek)
-- =====================================================================
-- ÖNEMLİ:
--   Bu script SADECE örnek/varsayılan değerlerle admin oluşturur.
--   Üretimde MUTLAKA `npm run admin:create -- e-posta` kullanın
--   (rastgele güçlü şifre üretir ve bcrypt ile hash'ler).
--
-- Aşağıdaki passwordHash, "admin123" şifresinin bcrypt hash'idir
-- (bcryptjs varsayılan 10 round). İlk girişten sonra HEMEN değiştirin.
-- =====================================================================

INSERT INTO "AdminUser" ("id", "email", "passwordHash", "name", "updatedAt")
VALUES (
  'admin_default',
  'admin@otodetailing.local',
  '$2b$12$fZ3WDNXVwsawhfL5bVW0euExjaCxhDUlHCYWe3NwVYTlTv3UUxRby',
  'Oto Detailing Admin',
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

SELECT id, email, name, "createdAt" FROM "AdminUser";
