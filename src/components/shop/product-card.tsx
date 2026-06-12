"use client";

import Image from "next/image";
import Link from "next/link";
import { formatTryFromCents } from "@/lib/money";
import { AddToCart } from "@/components/shop/add-to-cart";

export type ProductCardModel = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  category?: { name: string; slug: string };
};

export function ProductCard({ product }: { product: ProductCardModel }) {
  const href = `/urun/${product.slug}`;
  const inStock = product.stock > 0;

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/50 shadow-md shadow-black/20 ring-1 ring-white/5 transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:shadow-xl hover:shadow-brand-500/10 hover:ring-brand-500/20">
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover/card:scale-[1.06]"
        />
        {!product.imageUrl && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto block w-max rounded-full bg-zinc-950/70 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-300"
          >
            Görsel hazırlanıyor
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 px-3 text-center text-sm font-semibold text-amber-100">
            Stoklar tükendi
          </div>
        )}

        <div
          className={[
            "absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/55 p-5 backdrop-blur-[2px] transition duration-300 ease-out",
            "pointer-events-none opacity-0",
            "group-hover/card:pointer-events-auto group-hover/card:opacity-100",
            "[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100",
          ].join(" ")}
        >
          <div
            className={[
              "w-full max-w-[13.5rem] rounded-2xl border border-white/12 bg-zinc-950/88 p-5 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-md transition duration-300 ease-out",
              "scale-[0.97]",
              "group-hover/card:scale-100",
              "[@media(hover:none)]:scale-100",
            ].join(" ")}
          >
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {inStock ? "Hızlı işlem" : "Ürün detayı"}
            </p>
            <div className="flex flex-col items-stretch gap-2.5">
              <Link
                href={href}
                className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-amber-600 px-4 py-2.5 text-sm font-semibold tracking-tight text-zinc-950 shadow-lg shadow-black/30 transition hover:from-brand-400 hover:to-amber-500"
              >
                İncele
              </Link>
              {inStock && <AddToCart productId={product.id} disabled={false} variant="card" />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <p className="text-xs uppercase tracking-wide text-zinc-500">{product.category.name}</p>
        )}
        <Link href={href} className="line-clamp-2 text-sm font-semibold text-white hover:text-brand-300">
          {product.name}
        </Link>
        <div className="mt-auto pt-1">
          <p className="text-sm font-semibold text-brand-300">{formatTryFromCents(product.priceCents)}</p>
        </div>
      </div>
    </article>
  );
}
