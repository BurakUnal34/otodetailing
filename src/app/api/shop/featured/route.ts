import { NextRequest, NextResponse } from "next/server";
import { getFeaturedProductsPage } from "@/lib/featured-products";

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("sayfa");
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const payload = await getFeaturedProductsPage(page, PAGE_SIZE);
  return NextResponse.json({
    products: payload.products,
    page: payload.page,
  });
}
