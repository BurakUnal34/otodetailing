import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/site-config";

/** Arama motorları için önerilen yapılandırılmış veri (ekranda görünmez). */
export function ShopJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [buildWebSiteJsonLd(), buildOrganizationJsonLd()],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
