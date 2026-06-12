import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: `${SITE_NAME} site kullanım koşulları.`,
  alternates: { canonical: "/sayfa/kullanim-kosullari" },
};

export default function KullanimPage() {
  const b = getBusinessInfo();

  return (
    <LegalPage
      title="Kullanım Koşulları"
      updatedAt="29.04.2026"
      intro={
        <>
          {b.brandName} sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen siteyi
          kullanmadan önce dikkatlice okuyun.
        </>
      }
    >
      <h2>1. Hizmet Kapsamı</h2>
      <p>
        {b.brandName}, profesyonel araç bakım ürünlerinin online satışını yapan bir e-ticaret sitesidir.
        Ürün açıklamaları, görseller ve fiyatlar bilgilendirme amaçlıdır; sipariş onayı verene kadar
        herhangi bir bağlayıcılık doğurmaz.
      </p>

      <h2>2. Hesap ve Güvenlik</h2>
      <ul>
        <li>Ziyaretçi olarak sipariş verebilirsiniz; üyelik zorunlu değildir.</li>
        <li>Sipariş sırasında verdiğiniz bilgilerin doğruluğundan siz sorumlusunuz.</li>
        <li>Yanıltıcı bilgi, sahte sipariş veya dolandırıcılık girişimleri yasal yollara intikal ettirilir.</li>
      </ul>

      <h2>3. Fikri Mülkiyet</h2>
      <p>
        Site içeriği (metin, logo, görseller, kod) {b.legalName || b.brandName}&apos;a aittir. İzinsiz
        kopyalanamaz, çoğaltılamaz, ticari amaçla kullanılamaz.
      </p>

      <h2>4. Yasaklı Kullanım</h2>
      <ul>
        <li>Otomatik araçlarla (bot, scraper) sayfaları toplu indirme,</li>
        <li>Site güvenlik mekanizmalarını aşmaya çalışma,</li>
        <li>Yorum, form veya iletişim alanlarına spam, kötücül yazılım, hakaret içeren içerik gönderme,</li>
        <li>Diğer kullanıcıların verilerine yetkisiz erişim girişimi.</li>
      </ul>

      <h2>5. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Site, &quot;olduğu gibi&quot; sunulur. Hizmette kesinti, ağ veya barındırma sağlayıcı kaynaklı sorunlar,
        mücbir sebepler nedeniyle oluşabilecek dolaylı zararlardan {b.brandName} sorumlu değildir. Ürün
        kullanımına ilişkin önerilere mutlaka uyun; hatalı kullanımdan doğan sonuçlardan sorumluluk
        kullanıcıya aittir.
      </p>

      <h2>6. Hizmet Değişiklikleri</h2>
      <p>
        Sitenin içeriği, fiyatları, kampanyaları ve hizmet kapsamı önceden bildirimsiz değiştirilebilir.
        Onaylanmış siparişlerde fiyat değişikliği uygulanmaz.
      </p>

      <h2>7. Uyuşmazlık Çözümü</h2>
      <p>
        Bu koşullar Türkiye Cumhuriyeti hukukuna tâbidir. Uyuşmazlıklarda Tüketici Hakem Heyetleri ve
        İstanbul Mahkemeleri yetkilidir.
      </p>

      <h2>8. İletişim</h2>
      <p>
        Bu koşullar hakkında soru veya talepleriniz için <a href="/iletisim">iletişim sayfamızı</a>
        kullanabilirsiniz.
      </p>
    </LegalPage>
  );
}
