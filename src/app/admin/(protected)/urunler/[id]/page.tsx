import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUrunDuzenlePage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const priceTry = (product.priceCents / 100).toFixed(2).replace(".", ",");

  return (
    <div>
      <h1 className="text-xl font-bold text-white">Ürün düzenle</h1>
      <p className="mt-1 text-sm text-zinc-500">{product.name}</p>
      <div className="mt-8 max-w-3xl">
        <ProductForm
          categories={categories}
          mode={{ type: "edit", id: product.id }}
          initial={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceTry,
            stock: product.stock,
            imageUrl: product.imageUrl ?? "",
            categoryId: product.categoryId,
            active: product.active,
          }}
        />
      </div>
    </div>
  );
}
