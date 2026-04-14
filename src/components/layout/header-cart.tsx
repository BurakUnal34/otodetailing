"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart/cart-provider";

function CartBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M5 9h14l-1 12H6L5 9Z" />
    </svg>
  );
}

export function HeaderCart() {
  const { lines } = useCart();
  const totalQty = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const label = totalQty > 0 ? `Sepet, ${totalQty} ürün` : "Sepet";

  return (
    <Link
      href="/sepet"
      aria-label={label}
      className="group relative inline-flex items-center gap-2.5 rounded-xl border border-zinc-700/90 bg-gradient-to-b from-zinc-800/90 to-zinc-950/90 px-3.5 py-2.5 text-sm font-medium text-zinc-100 shadow-lg shadow-black/40 ring-1 ring-white/5 transition hover:border-brand-500/60 hover:from-zinc-800 hover:to-zinc-950 hover:text-white hover:shadow-brand-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
    >
      <CartBagIcon className="h-5 w-5 shrink-0 text-brand-400 transition group-hover:text-brand-300" />
      <span className="relative pr-0.5 font-semibold tracking-tight">
        Sepet
        {totalQty > 0 && (
          <span
            className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-zinc-950 shadow-md ring-2 ring-zinc-950"
            aria-hidden
          >
            {totalQty > 99 ? "99+" : totalQty}
          </span>
        )}
      </span>
    </Link>
  );
}
