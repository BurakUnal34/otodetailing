import type { Category, Product } from "@prisma/client";
import { absoluteUrl, getSiteUrl, SITE_NAME } from "@/lib/site-config";

type Props = {
  product: Product;
  category: Pick<Category, "name" | "slug">;
};

export function ProductJsonLd({ product, category }: Props) {
  const url = absoluteUrl(`/urun/${product.slug}`);
  const image = product.imageUrl ? absoluteUrl(product.imageUrl) : undefined;
  const price = (product.priceCents / 100).toFixed(2);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: category.name,
    ...(image ? { image: [image] } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${getSiteUrl()}/#organization` },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
