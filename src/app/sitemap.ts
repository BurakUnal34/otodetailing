import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-config";

/** Derleme sırasında veritabanı zorunlu olmasın; istek anında üretilir. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/urunler`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/iletisim`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/sayfa/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sayfa/gizlilik`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sayfa/cerez-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sayfa/mesafeli-satis-sozlesmesi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sayfa/iade-ve-cayma`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sayfa/kullanim-kosullari`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/kategori/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/urun/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
