import { BrandMarquee } from "@/components/layout/brand-marquee";
import { PageSplash } from "@/components/layout/page-splash";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteMap } from "@/components/layout/site-map";
import { ShopJsonLd } from "@/components/seo/shop-json-ld";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ShopJsonLd />
      <PageSplash durationMs={3400} fadeMs={600} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <BrandMarquee />
      <SiteMap />
      <SiteFooter />
    </div>
  );
}
