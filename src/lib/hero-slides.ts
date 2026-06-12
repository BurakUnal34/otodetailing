import type { HeroSlide } from "@/components/shop/hero-slider";

/**
 * Ana sayfa hero görselleri.
 *
 * Üretimde kendi görsellerinizi kullanmak için yapabileceğiniz iki yol var:
 *
 *  1) Hızlı yol: Görselleri `public/img/` klasörüne koyun ve aşağıdaki listede `src`
 *     değerlerini `/img/<dosya-adı>` olarak güncelleyin (örn. `/img/1.png`).
 *
 *  2) Env tabanlı override: `NEXT_PUBLIC_HERO_SLIDES` ortam değişkenine bir JSON dizisi koyun.
 *     Örn: `[{"src":"/img/1.png","alt":"...","content":{"label":"...","title":"...","description":"...","primary":{"href":"/urunler","label":"İncele"}}}]`
 *     Tanımlıysa varsayılanlar tamamen yok sayılır.
 */

const DEFAULT_HOME_HERO_SLIDES: HeroSlide[] = [
  {
    src: "/img/1.png",
    alt: "Araç içi detay ve bakım",
    content: {
      label: "Profesyonel araç bakımı",
      title: "Temizlik, koruma ve parlaklık için seçilmiş ürünler.",
      description:
        "Kategorilere göre keşfedin, detaylı ürün sayfalarında içerik ve stok bilgisini görün, güvenli ödeme ile siparişinizi tamamlayın.",
      primary: { href: "/urunler", label: "Ürünlere göz at" },
      secondary: { href: "/kategori/cila-koruma", label: "Cila & koruma" },
    },
  },
  {
    src: "/img/2.png",
    alt: "Araç dış yüzey ve parlaklık",
    content: {
      label: "Dış yüzey bakımı",
      title: "Köpük, şampuan ve güvenli yıkama ile parlak sonuç.",
      description:
        "Boya ve trim için seçilmiş dış temizlik ürünleri; yüzey hazırlığından hızlı cila adımına kadar ihtiyacınız olanları keşfedin.",
      primary: { href: "/kategori/dis-yikama", label: "Dış yıkama ürünleri" },
      secondary: { href: "/urunler", label: "Tüm ürünler" },
    },
  },
  {
    src: "/img/3.png",
    alt: "Cila ve parlatıcı uygulama",
    content: {
      label: "Cila & parlaklık",
      title: "Wax, hızlı cila ve uzun süreli koruma seçenekleri.",
      description:
        "Boya derinliğini ortaya çıkaran ürünler ve seramik / sealant katmanlarıyla yüzeyinizi günlük kirleticilere karşı güçlendirin.",
      primary: { href: "/kategori/cila-koruma", label: "Cila & koruma" },
      secondary: { href: "/kategori/mikrofiber-aksesuar", label: "Mikrofiber & aksesuar" },
    },
  },
];

function isHeroSlide(value: unknown): value is HeroSlide {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.src !== "string" || typeof v.alt !== "string") return false;
  const c = v.content as Record<string, unknown> | undefined;
  if (!c || typeof c !== "object") return false;
  if (typeof c.label !== "string" || typeof c.title !== "string" || typeof c.description !== "string") return false;
  const p = c.primary as Record<string, unknown> | undefined;
  if (!p || typeof p.href !== "string" || typeof p.label !== "string") return false;
  return true;
}

export function getHomeHeroSlides(): HeroSlide[] {
  const raw = process.env.NEXT_PUBLIC_HERO_SLIDES?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isHeroSlide)) {
        return parsed;
      }
      console.warn("[hero] NEXT_PUBLIC_HERO_SLIDES geçersiz, varsayılan kullanılıyor.");
    } catch (err) {
      console.warn("[hero] NEXT_PUBLIC_HERO_SLIDES parse hatası:", err);
    }
  }
  return DEFAULT_HOME_HERO_SLIDES;
}
