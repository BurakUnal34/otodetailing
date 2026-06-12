import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: `${SITE_NAME} kişisel verilerin korunması hakkında aydınlatma metni.`,
  alternates: { canonical: "/sayfa/kvkk" },
};

export default function KvkkPage() {
  const b = getBusinessInfo();
  const dataController = b.legalName || b.brandName;

  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      updatedAt="29.04.2026"
      intro={
        <>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri sorumlusu sıfatıyla
          {" "}
          <strong>{dataController}</strong>, kişisel verilerinizi aşağıda açıklanan kapsamda işlemektedir.
        </>
      }
    >
      <h2>1. Veri Sorumlusu</h2>
      <p>
        Veri sorumlusu: <strong>{dataController}</strong>
        {b.address ? (
          <>
            {" "}
            (Adres: {b.address})
          </>
        ) : null}
        {b.email ? (
          <>
            {". "}İletişim: <a href={`mailto:${b.email}`}>{b.email}</a>
          </>
        ) : null}
        {b.phone ? <>{` · Tel: ${b.phone}`}</> : null}.
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik:</strong> ad, soyad.</li>
        <li><strong>İletişim:</strong> e-posta adresi, telefon numarası, teslimat adresi.</li>
        <li><strong>Müşteri işlem:</strong> sipariş bilgileri, sepet içeriği, ödeme tutarı.</li>
        <li><strong>İşlem güvenliği:</strong> IP adresi, çerez verileri, oturum bilgileri.</li>
        <li><strong>Pazarlama:</strong> tercih ettiğiniz iletişim kanalları (yalnızca açık rıza ile).</li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <ul>
        <li>Sipariş ve ödeme süreçlerinin yürütülmesi, sözleşmenin kurulması ve ifası,</li>
        <li>Faturalandırma, kargo / teslimat ve satış sonrası destek hizmetleri,</li>
        <li>Mesafeli satış mevzuatı ve vergi mevzuatından doğan yükümlülüklerin yerine getirilmesi,</li>
        <li>Hukuki uyuşmazlıkların çözümü ve talep / şikâyetlerin değerlendirilmesi,</li>
        <li>Bilgi güvenliği, dolandırıcılığın önlenmesi ve site / sistem yönetimi,</li>
        <li>Açık rızanız varsa elektronik ticari ileti gönderimi.</li>
      </ul>

      <h2>4. Aktarılan Taraflar</h2>
      <p>
        Kişisel verileriniz; ödeme hizmet sağlayıcısı (Stripe), e-posta sağlayıcısı, kargo şirketleri,
        muhasebe ve hukuki danışmanlar ile mevzuat gereği talep eden yetkili kamu kurum / kuruluşlarıyla,
        sınırlı amaçla ve gerektiği ölçüde paylaşılabilir. Yurt dışına aktarımlar yalnızca açık rızanız
        veya KVKK m.9&apos;da öngörülen istisnalar çerçevesinde gerçekleştirilir.
      </p>

      <h2>5. Toplama Yöntemi ve Hukuki Sebep</h2>
      <p>
        Verileriniz; sipariş formu, üyelik / iletişim formları, çerezler ve elektronik haberleşme yoluyla
        otomatik veya kısmen otomatik yöntemlerle toplanır. Hukuki sebepler; KVKK m.5/2 (c) sözleşmenin
        kurulması ve ifası, (ç) hukuki yükümlülük, (e) hak tesisi / korunması, (f) meşru menfaat ve
        gerektiğinde m.5/1 açık rızadır.
      </p>

      <h2>6. Saklama Süresi</h2>
      <p>
        Verileriniz; ilgili mevzuatta öngörülen süreler (örn. Vergi Usul Kanunu kapsamında 5 yıl, Türk
        Ticaret Kanunu kapsamında 10 yıl) ve işleme amacının gerektirdiği süre boyunca saklanır; süre
        bitiminde silinir, yok edilir veya anonim hâle getirilir.
      </p>

      <h2>7. Haklarınız (KVKK m.11)</h2>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse bilgi talep etme,</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içi / yurt dışında aktarıldığı tarafları bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK&apos;da öngörülen şartlar çerçevesinde silinmesini / yok edilmesini isteme,</li>
        <li>Aktarıldığı taraflara bildirilmesini isteme,</li>
        <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
        <li>Hukuka aykırı işleme nedeniyle zarara uğramanız hâlinde zararınızın giderilmesini talep etme.</li>
      </ul>

      <h2>8. Başvuru</h2>
      <p>
        Haklarınızı kullanmak için <a href="/iletisim">iletişim sayfamız</a> üzerinden veya
        {b.email ? (
          <>
            {" "}
            <a href={`mailto:${b.email}`}>{b.email}</a> e-posta adresine
          </>
        ) : (
          " e-posta adresimize"
        )}
        {" "}
        Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ&apos;e uygun şekilde başvurabilirsiniz.
        Başvurunuz en geç 30 gün içinde sonuçlandırılır.
      </p>
    </LegalPage>
  );
}
