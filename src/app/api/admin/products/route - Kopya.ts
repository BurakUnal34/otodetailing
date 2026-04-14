import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(90).optional(),
  description: z.string().min(1).max(8000),
  priceCents: z.number().int().positive(),
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().url().max(2000).optional().nullable(),
  categoryId: z.string().min(1),
  active: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description.trim(),
        priceCents: parsed.data.priceCents,
        stock: parsed.data.stock,
        imageUrl: parsed.data.imageUrl ?? null,
        categoryId: parsed.data.categoryId,
        active: parsed.data.active ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug veya veri çakışması" }, { status: 409 });
  }
}
