import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUrunYeniPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-white">Yeni ürün</h1>
      <p className="mt-1 text-sm text-zinc-500">Kataloga ekleme</p>
      <div className="mt-8 max-w-3xl">
        <ProductForm categories={categories} mode={{ type: "create" }} />
      </div>
    </div>
  );
}
