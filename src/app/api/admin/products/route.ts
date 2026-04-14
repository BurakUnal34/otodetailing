import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedJson } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type Body = {
  name?: string;
  slug?: string;
  description?: string;
  priceCents?: number;
  stock?: number;
  imageUrl?: string | null;
  categoryId?: string;
  active?: boolean;
};

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const name = body.name?.trim();
  const description = body.description?.trim();
  const slug = (body.slug?.trim() || (name ? slugify(name) : "")) || "";
  const categoryId = body.categoryId?.trim();

  if (!name || !description || !slug || !categoryId) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
  }

  const priceCents = typeof body.priceCents === "number" ? Math.round(body.priceCents) : NaN;
  const stock = typeof body.stock === "number" ? Math.floor(body.stock) : NaN;
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json({ error: "Geçersiz fiyat." }, { status: 400 });
  }
  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json({ error: "Geçersiz stok." }, { status: 400 });
  }

  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) {
    return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 400 });
  }

  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
  const active = typeof body.active === "boolean" ? body.active : true;

  try {
    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        priceCents,
        stock,
        imageUrl,
        categoryId,
        active,
      },
    });
    return NextResponse.json({ id: created.id });
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız (slug benzersiz olmalı)." }, { status: 409 });
  }
}
