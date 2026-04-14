import type { ProductCardModel } from "@/components/shop/product-card";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 12;

function toCardModel(
  p: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    stock: number;
    imageUrl: string | null;
    category: { name: string; slug: string };
  },
): ProductCardModel {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceCents: p.priceCents,
    stock: p.stock,
    imageUrl: p.imageUrl,
    category: p.category,
  };
}

export async function getFeaturedProductsPage(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const featuredWhere = { active: true };

  const total = await prisma.product.count({ where: featuredWhere });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const skip = (safePage - 1) * pageSize;

  const rows = await prisma.product.findMany({
    where: featuredWhere,
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      stock: true,
      imageUrl: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const products = rows.map(toCardModel);

  return {
    products,
    page: safePage,
    totalPages,
    total,
    pageSize,
  };
}
