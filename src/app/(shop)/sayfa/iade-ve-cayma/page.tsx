import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "İade ve Cayma Hakkı",
  description: `${SITE_NAME} iade, değişim ve cayma hakkı politikası.`,
  alternates: { canonical: "/sayfa/iade-ve-cayma" },
};

export default function IadePage() {
  const b = getBusinessInfo();

  return (
    <LegalPage
      title="İade ve Cayma Hakkı"
      updatedAt="29.04.2026"
      intro={
        <>
          Bu sayfa Mesafeli Sözleşmeler Yönetmeliği uyarınca cayma hakkınızı ve iade prosedürümüzü
          özetler. Detaylı şartlar için
          {" "}
          <a href="/sayfa/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a>&apos;ne bakın.
        </>
      }
    >
      <h2>14 Günlük Cayma Hakkı</h2>
      <p>
        Ürünü teslim aldığınız günden itibaren <strong>14 gün</strong> içinde gerekçe göstermeksizin
        cayma hakkınızı kullanabilirsiniz. Cayma bildirimini bu süre içinde tarafımıza ulaştırmanız
        yeterlidir.
      </p>

      <h2>Cayma Bildirimi Nasıl Yapılır?</h2>
      <ol>
        <li>
          {b.email ? (
            <>
              <a href={`mailto:${b.email}`}>{b.email}</a> adresine
            </>
          ) : (
            "Bizimle iletişim sayfasından"
          )}
          {" "}
          aşağıdaki bilgileri içeren bir mesaj gönderin: ad soyad, sipariş numarası, sipariş tarihi,
          teslim alma tarihi, iade etmek istediğiniz ürün(ler), iade nedeniniz (zorunlu değil), IBAN
          (banka iadesi için).
        </li>
        <li>Cayma onayımız size e-posta ile iletilir.</li>
        <li>Ürünü, orijinal ambalajı ve faturasıyla birlikte aşağıda belirtilen adrese kargo ile gönderin.</li>
      </ol>

      <h2>İade Adresi</h2>
      <p>
        {b.legalName || b.brandName}
        {b.address ? <><br />{b.address}</> : null}
      </p>

      <h2>İade Şartları</h2>
      <ul>
        <li>Ürün kullanılmamış, yeniden satılabilir durumda ve orijinal ambalajında olmalıdır.</li>
        <li>Faturası ve aksesuarları/promosyon ürünleri eksiksiz iade edilmelidir.</li>
        <li>Hijyen kuralları gereği ambalajı açılmış kimyasal ürünler iade kapsamı dışındadır.</li>
        <li>Kişiselleştirilmiş ürünler iade edilemez.</li>
      </ul>

      <h2>Ödeme İadesi</h2>
      <p>
        Ürün tarafımıza ulaştıktan ve kontrol edildikten sonra <strong>14 gün</strong> içinde, ödemeyi
        gerçekleştirdiğiniz karta iade yapılır. Bankalar iadenin hesaba yansımasını 2-10 iş günü içinde
        gerçekleştirebilir; bu süreçte sorumluluk bankanıza aittir.
      </p>

      <h2>Kargo Bedeli</h2>
      <ul>
        <li>Cayma hakkı kullanımında <strong>iade kargo</strong> bedeli, anlaşmalı kargo şirketimizle gönderim yapıldığında tarafımızca karşılanır; başka bir kargo seçilirse tüketiciye aittir.</li>
        <li>Hatalı / hasarlı / yanlış gönderilen ürünlerde tüm kargo masrafları Satıcı tarafından karşılanır.</li>
      </ul>

      <h2>Hasarlı veya Yanlış Ürün</h2>
      <p>
        Paket teslim alındığında hasar fark edildiyse kargo görevlisine tutanak tutturun ve 24 saat
        içinde tarafımıza bildirin. Yanlış ürün gönderiminde değişim ücretsiz yapılır.
      </p>

      <h2>İletişim</h2>
      <p>
        Sorularınız için <a href="/iletisim">iletişim sayfamız</a>
        {b.email ? <> veya <a href={`mailto:${b.email}`}>{b.email}</a></> : null} üzerinden
        bize ulaşabilirsiniz.
      </p>
    </LegalPage>
  );
}
