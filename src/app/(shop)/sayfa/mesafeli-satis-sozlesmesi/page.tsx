import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getBusinessInfo, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: `${SITE_NAME} mesafeli satış sözleşmesi.`,
  alternates: { canonical: "/sayfa/mesafeli-satis-sozlesmesi" },
};

export default function MesafeliSatisPage() {
  const b = getBusinessInfo();
  const seller = b.legalName || b.brandName;

  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      updatedAt="29.04.2026"
      intro={
        <>
          İşbu sözleşme; 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği uyarınca, aşağıda bilgileri verilen Satıcı ile Alıcı arasında, Alıcı&apos;nın
          {" "}
          <strong>{b.brandName}</strong> üzerinden elektronik ortamda sipariş verdiği ürün(ler) için
          akdedilmiştir.
        </>
      }
    >
      <h2>1. Taraflar</h2>
      <h3>Satıcı</h3>
      <p>
        Unvan: <strong>{seller}</strong>
        {b.address ? <><br />Adres: {b.address}</> : null}
        {b.taxOffice && b.taxNumber ? (
          <>
            <br />
            Vergi Dairesi / No: {b.taxOffice} / {b.taxNumber}
          </>
        ) : null}
        {b.mersis ? <><br />MERSİS No: {b.mersis}</> : null}
        {b.email ? <><br />E-posta: <a href={`mailto:${b.email}`}>{b.email}</a></> : null}
        {b.phone ? <><br />Telefon: {b.phone}</> : null}
      </p>
      <h3>Alıcı</h3>
      <p>
        Sipariş sırasında girilen ad soyad, e-posta, telefon ve teslimat adresi bilgilerinin sahibi olan
        kişi/kişilerdir.
      </p>

      <h2>2. Sözleşme Konusu</h2>
      <p>
        Sözleşme&apos;nin konusu; Alıcı&apos;nın Satıcı&apos;ya ait <strong>{b.brandName}</strong> internet
        sitesinden elektronik ortamda sipariş verdiği, sipariş özet sayfasında ve onay e-postasında
        belirtilen ürün(ler)in satışı ile teslimi ve bedeli, ödeme şekli, teslimat ve cayma hakkına ilişkin
        koşulların düzenlenmesidir.
      </p>

      <h2>3. Ürün Bilgileri ve Bedel</h2>
      <p>
        Ürünlerin temel nitelikleri, satış fiyatı (KDV dahil), kargo ücreti ve toplam tutar, sipariş
        özet sayfasında ve onay e-postasında belirtilir. Listelenen fiyatlar satış anındaki güncel
        fiyatlardır; promosyonlar süreyle sınırlı olabilir.
      </p>

      <h2>4. Ödeme</h2>
      <p>
        Ödeme; Satıcı&apos;nın anlaşmalı olduğu ödeme hizmet sağlayıcısı (Stripe) altyapısı üzerinden
        kredi/banka kartı ile alınır. Kart bilgileri Satıcı tarafından saklanmaz.
      </p>

      <h2>5. Teslimat</h2>
      <ul>
        <li>Ürünler, Alıcı&apos;nın belirttiği adrese anlaşmalı kargo şirketi ile teslim edilir.</li>
        <li>Tahmini teslimat süresi, sipariş onayını takiben en geç 30 gündür.</li>
        <li>Teslimat anında paket hasarlıysa kargo görevlisine tutanak tutturulması ve Satıcı&apos;ya bildirilmesi gerekir.</li>
        <li>Teslimat masrafları aksi belirtilmedikçe sipariş özetinde gösterilen tutara dahildir/değildir.</li>
      </ul>

      <h2>6. Cayma Hakkı</h2>
      <p>
        Alıcı; teslim aldığı tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe
        göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma bildirimi
        {" "}
        {b.email ? (
          <>
            <a href={`mailto:${b.email}`}>{b.email}</a> adresine
          </>
        ) : (
          "Satıcı&apos;ya yazılı olarak"
        )}
        {" "}
        iletilmelidir. Detaylar için <a href="/sayfa/iade-ve-cayma">İade ve Cayma</a> sayfasına bakınız.
      </p>

      <h3>Cayma Hakkının İstisnaları</h3>
      <ul>
        <li>Tüketicinin istekleri doğrultusunda kişiselleştirilmiş ürünler,</li>
        <li>Sağlık ve hijyen açısından uygun olmayan, ambalajı açılmış ürünler,</li>
        <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler.</li>
      </ul>

      <h2>7. Genel Hükümler</h2>
      <ul>
        <li>Alıcı, sipariş onayı vermeden önce ürün niteliklerini ve tüm satış koşullarını okuduğunu kabul eder.</li>
        <li>Mücbir sebep hâllerinde Satıcı, sözleşmeyi ifa edemediği takdirde durumu Alıcı&apos;ya bildirir ve ödenen bedel iade edilir.</li>
        <li>Uyuşmazlıklarda Tüketici Hakem Heyeti ve Tüketici Mahkemeleri yetkilidir; başvuru limitleri Ticaret Bakanlığı tarafından her yıl güncellenir.</li>
      </ul>

      <h2>8. Yürürlük</h2>
      <p>
        Alıcı, ödeme adımında bu sözleşmeyi onayladığını teyit eder. Onayla birlikte sözleşme
        elektronik ortamda kurulmuş sayılır ve sözleşme metni Alıcı&apos;ya kalıcı veri saklayıcısı
        (e-posta) ile iletilir.
      </p>
    </LegalPage>
  );
}
