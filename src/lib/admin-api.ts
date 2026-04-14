import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  return getServerSession(authOptions);
}

export function unauthorizedJson() {
  return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
}
