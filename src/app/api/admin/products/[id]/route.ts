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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Geçersiz" }, { status: 400 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Ürün yok." }, { status: 404 });
  }

  const name = body.name !== undefined ? body.name.trim() : existing.name;
  const description = body.description !== undefined ? body.description.trim() : existing.description;
  const slugInput = body.slug?.trim();
  const slug =
    slugInput !== undefined && slugInput.length > 0
      ? slugInput
      : body.name !== undefined && body.name.trim()
        ? slugify(body.name.trim())
        : existing.slug;

  const categoryId = body.categoryId?.trim() ?? existing.categoryId;
  const priceCents =
    typeof body.priceCents === "number" ? Math.round(body.priceCents) : existing.priceCents;
  const stock = typeof body.stock === "number" ? Math.floor(body.stock) : existing.stock;
  const imageUrl =
    body.imageUrl === undefined
      ? existing.imageUrl
      : typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null;
  const active = typeof body.active === "boolean" ? body.active : existing.active;

  if (!name || !description || !slug) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
  }
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

  try {
    await prisma.product.update({
      where: { id },
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kayıt başarısız (slug benzersiz olmalı)." }, { status: 409 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedJson();

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Geçersiz" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sipariş geçmişi nedeniyle silinemez; ürünü pasifleştirin." },
      { status: 409 },
    );
  }
}
