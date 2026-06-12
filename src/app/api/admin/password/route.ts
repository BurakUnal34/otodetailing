import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdminSession, unauthorizedJson } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const PASSWORD_MIN = 10;

type Body = {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmNewPassword?: unknown;
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`admin-password:${ip}`, 5, 5 / (10 * 60 * 1000));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen bekleyip tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const session = await requireAdminSession();
  if (!session?.user?.email) return unauthorizedJson();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const next = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirm = typeof body.confirmNewPassword === "string" ? body.confirmNewPassword : "";

  if (!current || !next || !confirm) {
    return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
  }
  if (next !== confirm) {
    return NextResponse.json({ error: "Yeni şifre tekrarı uyuşmuyor." }, { status: 400 });
  }
  if (next.length < PASSWORD_MIN) {
    return NextResponse.json(
      { error: `Yeni şifre en az ${PASSWORD_MIN} karakter olmalı.` },
      { status: 400 },
    );
  }
  if (next === current) {
    return NextResponse.json(
      { error: "Yeni şifre mevcut şifre ile aynı olamaz." },
      { status: 400 },
    );
  }

  const user = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedJson();

  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(next, 12);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
