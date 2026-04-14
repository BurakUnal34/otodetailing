"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { formatTryFromCents } from "@/lib/money";
import type { ShopSearchProduct } from "@/app/api/shop/search/route";

type Variant = "header" | "panel";

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ProductSearch({
  variant = "panel",
  placeholder = "Ürün ara…",
}: {
  variant?: Variant;
  placeholder?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShopSearchProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const fetchResults = useCallback(async (q: string) => {
    const t = q.trim();
    if (t.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/search?q=${encodeURIComponent(t)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { products: ShopSearchProduct[] };
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = query.trim();
    if (t.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const idTimer = window.setTimeout(() => {
      void fetchResults(query);
    }, 220);
    return () => window.clearTimeout(idTimer);
  }, [query, fetchResults]);

  useEffect(() => {
    function onDocPointer(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  const showPanel = open && query.trim().length >= 2;
  const headerInput =
    variant === "header"
      ? "h-10 w-full min-w-0 rounded-xl border border-zinc-700/90 bg-zinc-900/90 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none ring-brand-500/0 transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25 sm:max-w-[220px] md:max-w-[280px]"
      : "h-11 w-full rounded-xl border border-zinc-700/90 bg-zinc-900/90 pl-11 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none ring-brand-500/0 transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25";

  return (
    <div ref={wrapRef} className={variant === "header" ? "relative w-full max-w-[280px] flex-1 sm:flex-initial" : "relative w-full max-w-xl"}>
      <label htmlFor={`${id}-input`} className="sr-only">
        Ürün ara
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (e.target.value.trim().length >= 2) setOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          className={headerInput}
          onKeyDown={(e) => {
            if (!showPanel || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
              e.preventDefault();
              window.location.href = `/urun/${results[activeIndex].slug}`;
            }
          }}
        />
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] max-h-[min(70vh,380px)] overflow-auto rounded-xl border border-zinc-700/90 bg-zinc-950/98 py-1 shadow-2xl shadow-black/60 ring-1 ring-white/5 backdrop-blur-md"
        >
          {loading && <p className="px-3 py-3 text-center text-xs text-zinc-500">Aranıyor…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-3 text-center text-xs text-zinc-500">Eşleşen ürün yok.</p>
          )}
          {!loading &&
            results.map((p, idx) => {
              const active = idx === activeIndex;
              return (
                <Link
                  key={p.id}
                  href={`/urun/${p.slug}`}
                  role="option"
                  aria-selected={active}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 text-left transition",
                    active ? "bg-brand-500/15 ring-1 ring-inset ring-brand-500/30" : "hover:bg-zinc-900/80",
                  ].join(" ")}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-zinc-600">—</span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-white">{p.name}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{p.category.name}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-brand-300">{formatTryFromCents(p.priceCents)}</span>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
