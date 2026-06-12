import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: `${SITE_NAME} gizlilik politikası — verilerinizi nasıl topluyor ve koruyoruz.`,
  alternates: { canonical: "/sayfa/gizlilik" },
};

export default function GizlilikPage() {
  const b = getBusinessInfo();

  return (
    <LegalPage
      title="Gizlilik Politikası"
      updatedAt="29.04.2026"
      intro={
        <>
          Bu politika, {b.brandName} olarak online mağazamızda hangi bilgileri topladığımızı, nasıl
          kullandığımızı ve nasıl koruduğumuzu açıklar.
        </>
      }
    >
      <h2>Topladığımız Bilgiler</h2>
      <ul>
        <li>Sipariş verirken paylaştığınız ad, e-posta, telefon ve teslimat adresi,</li>
        <li>Ödeme bilgileri (kart numaranız bizde saklanmaz; Stripe tarafından PCI-DSS uyumlu işlenir),</li>
        <li>Site kullanımı sırasında otomatik alınan IP adresi, tarayıcı bilgisi ve çerezler,</li>
        <li>İletişim formundan gönderdiğiniz mesaj içerikleri.</li>
      </ul>

      <h2>Kullanım Amaçları</h2>
      <p>
        Bilgilerinizi yalnızca; siparişinizi tamamlamak, kargo / teslimat sürecini yönetmek, satış
        sonrası destek sunmak, yasal yükümlülükleri yerine getirmek ve siteyi güvenli tutmak için
        kullanırız. Açık rızanız olmadıkça reklam veya pazarlama mesajı göndermeyiz.
      </p>

      <h2>Üçüncü Taraflar</h2>
      <p>
        Hizmet alabilmek için aşağıdaki sağlayıcılarla sınırlı veri paylaşımı yapılır:
      </p>
      <ul>
        <li><strong>Stripe</strong> — ödeme işleme (kart bilgileriniz Stripe&apos;te tutulur).</li>
        <li><strong>Vercel</strong> — site barındırma ve görsel depolama.</li>
        <li><strong>Resend / e-posta sağlayıcısı</strong> — sipariş onay maillerinin gönderimi.</li>
        <li><strong>Kargo şirketi</strong> — paketin teslim edilmesi.</li>
      </ul>

      <h2>Çerezler</h2>
      <p>
        Sepet işlevi ve oturum yönetimi için zorunlu çerezler kullanılır. Analitik / pazarlama çerezleri
        kullanılması durumunda öncesinde onayınız alınır. Detaylar için
        {" "}
        <a href="/sayfa/cerez-politikasi">çerez politikamıza</a> bakın.
      </p>

      <h2>Veri Güvenliği</h2>
      <p>
        Site HTTPS ile şifrelenir, yönetim paneline yalnızca yetkili personel erişir, şifreler bcrypt ile
        hash&apos;lenir. Buna rağmen internet üzerinden tam güvenlik garanti edilemez; risk farkındalığıyla
        kullanmanızı tavsiye ederiz.
      </p>

      <h2>Saklama Süresi</h2>
      <p>
        Sipariş kayıtları yasal saklama süreleri (vergi mevzuatı için 5 yıl, ticari defterler için 10 yıl)
        boyunca saklanır. Pazarlama amaçlı veriler, rızanızı geri çekene kadar tutulur.
      </p>

      <h2>Haklarınız</h2>
      <p>
        KVKK kapsamındaki haklarınız <a href="/sayfa/kvkk">KVKK Aydınlatma Metni</a> sayfasında
        belirtilmiştir.
      </p>

      <h2>Politika Değişiklikleri</h2>
      <p>
        Bu politika güncellenebilir. Güncelleme tarihi sayfa başında belirtilir; önemli değişikliklerde
        sitede duyuru yaparız.
      </p>

      <h2>İletişim</h2>
      <p>
        Sorularınız için
        {" "}
        {b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : "iletişim sayfamızı"}
        {" "}
        kullanabilirsiniz.
      </p>
    </LegalPage>
  );
}
