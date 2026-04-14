import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type ShopSearchProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  category: { name: string; slug: string };
};

function rankMatch(name: string, slug: string, qRaw: string, terms: string[]): number {
  const nl = name.toLocaleLowerCase("tr-TR");
  const sl = slug.toLowerCase();
  const ql = qRaw.trim().toLocaleLowerCase("tr-TR");
  if (!ql) return 0;

  let score = 0;
  if (nl === ql) score += 200;
  if (nl.startsWith(ql)) score += 120;
  const phraseIdx = nl.indexOf(ql);
  if (phraseIdx >= 0) score += 90 - Math.min(phraseIdx, 35);

  const slugNorm = ql.replace(/\s+/g, "-");
  if (sl === slugNorm || sl.includes(slugNorm)) score += 70;

  for (const t of terms) {
    const tl = t.toLocaleLowerCase("tr-TR");
    if (!tl) continue;
    if (nl.includes(tl)) score += 35;
    if (sl.includes(tl)) score += 22;
    if (nl.startsWith(tl)) score += 25;
  }

  return score;
}

export async function GET(req: NextRequest) {
  const qRaw = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (qRaw.length < 2) {
    return NextResponse.json({ products: [] satisfies ShopSearchProduct[] });
  }

  const terms = qRaw.split(/\s+/).filter((t) => t.length >= 2);
  const searchTerms = terms.length ? terms : [qRaw];

  const rows = await prisma.product.findMany({
    where: {
      active: true,
      OR: searchTerms.flatMap((t) => [
        { name: { contains: t } },
        { slug: { contains: t.toLowerCase() } },
      ]),
    },
    take: 48,
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      stock: true,
      imageUrl: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const scored = rows
    .map((p) => ({
      p,
      score: rankMatch(p.name, p.slug, qRaw, searchTerms),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ p }) => p);

  return NextResponse.json({ products: scored satisfies ShopSearchProduct[] });
}
