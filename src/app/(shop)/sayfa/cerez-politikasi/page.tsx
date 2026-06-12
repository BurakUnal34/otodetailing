import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: `${SITE_NAME} çerez politikası — kullandığımız çerezler ve nasıl yönetebileceğiniz.`,
  alternates: { canonical: "/sayfa/cerez-politikasi" },
};

export default function CerezPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      updatedAt="29.04.2026"
      intro={
        <>
          Çerezler (cookie); ziyaret ettiğiniz sitelerin bilgisayarınız veya mobil cihazınızda küçük metin
          dosyaları olarak sakladığı bilgilerdir. Bu sayfa hangi çerezleri kullandığımızı ve nasıl
          yönetebileceğinizi açıklar.
        </>
      }
    >
      <h2>Kullandığımız Çerez Türleri</h2>
      <h3>1. Zorunlu (oturum) çerezleri</h3>
      <p>
        Sitenin temel işlevleri için gereklidir; bunlar olmadan sepet ve oturum çalışmaz. Onay
        gerektirmez.
      </p>
      <ul>
        <li><code>next-auth.session-token</code> — yönetici oturumunu yönetir.</li>
        <li><code>otodetailing.cart</code> — sepet içeriğini tarayıcınızda saklar (LocalStorage).</li>
        <li><code>cookie-consent</code> — çerez onay tercihinizi saklar.</li>
      </ul>

      <h3>2. Performans ve analitik çerezler</h3>
      <p>
        Yalnızca açık onayınız varsa kullanılır. Sitenin nasıl kullanıldığını anlamamızı sağlar; kişisel
        kimlik bilgisi içermez. Şu anda bu kategoride çerez tanımlı değildir; eklersek bu sayfa
        güncellenir.
      </p>

      <h3>3. Pazarlama çerezleri</h3>
      <p>
        Reklam ve hedefleme amaçlı çerezler. Onayınız olmadan tetiklenmez.
      </p>

      <h2>Üçüncü Taraf Çerezleri</h2>
      <p>
        Ödeme akışı sırasında <strong>Stripe</strong> kendi alanı (<em>checkout.stripe.com</em>) üzerinde
        kendi çerezlerini kullanır; bu çerezler Stripe&apos;ın gizlilik politikasına tâbidir.
      </p>

      <h2>Çerezleri Yönetme</h2>
      <p>
        Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezleri devre
        dışı bırakırsanız sepet ve oturum işlevleri çalışmayabilir.
      </p>
      <ul>
        <li>Chrome: Ayarlar → Gizlilik ve güvenlik → Çerezler.</li>
        <li>Safari: Tercihler → Gizlilik.</li>
        <li>Firefox: Ayarlar → Gizlilik ve Güvenlik.</li>
      </ul>

      <h2>Onayın Geri Alınması</h2>
      <p>
        Site alt kısmındaki çerez bildirimi tekrar görünene kadar tarayıcı LocalStorage&apos;ından
        <code> cookie-consent </code> kaydını silerek seçiminizi sıfırlayabilirsiniz.
      </p>
    </LegalPage>
  );
}
