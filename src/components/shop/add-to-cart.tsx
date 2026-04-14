"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type Variant = "default" | "card";

export function AddToCart({
  productId,
  disabled,
  variant = "default",
}: {
  productId: string;
  disabled?: boolean;
  variant?: Variant;
}) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const isCard = variant === "card";

  if (disabled) {
    return (
      <div className={isCard ? "w-full" : "space-y-2"}>
        <button
          type="button"
          disabled
          className={
            isCard
              ? "inline-flex min-h-[2.75rem] w-full cursor-not-allowed items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-sm font-semibold tracking-tight text-zinc-500"
              : "w-full cursor-not-allowed rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-500"
          }
        >
          Stoklar tükendi
        </button>
      </div>
    );
  }

  return (
    <div className={isCard ? "w-full" : "space-y-2"}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          add(productId, 1);
          if (!isCard) setMsg("Sepete eklendi");
          setTimeout(() => setBusy(false), 250);
          if (!isCard) setTimeout(() => setMsg(null), 1600);
        }}
        className={
          isCard
            ? "inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl border border-zinc-500/60 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold tracking-tight text-zinc-100 shadow-inner transition hover:border-brand-400/45 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            : "w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        Sepete ekle
      </button>
      {!isCard && msg && <p className="text-center text-xs text-brand-200">{msg}</p>}
    </div>
  );
}
