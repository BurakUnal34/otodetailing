import { NextResponse } from "next/server";
import { getFeaturedProductsPage } from "@/lib/featured-products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = Number.parseInt(searchParams.get("sayfa") ?? "1", 10);
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  try {
    const data = await getFeaturedProductsPage(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Yüklenemedi" }, { status: 500 });
  }
}
