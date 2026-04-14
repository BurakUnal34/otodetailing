import { NextResponse } from "next/server";
import { requireAdminSession, unauthorizedJson } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const ALLOWED = ["BEKLEMEDE", "ODENDI", "IPTAL"] as const;

type Body = { status?: string };

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

  const status = body.status;
  if (!status || !ALLOWED.includes(status as (typeof ALLOWED)[number])) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Sipariş yok." }, { status: 404 });
  }

  await prisma.order.update({
    where: { id },
    data: { status: status as (typeof ALLOWED)[number] },
  });

  return NextResponse.json({ ok: true });
}
