"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "otodetailing-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setLines(
            parsed
              .filter(
                (x) =>
                  x &&
                  typeof x === "object" &&
                  typeof (x as CartLine).productId === "string" &&
                  typeof (x as CartLine).quantity === "number",
              )
              .map((x) => ({
                productId: (x as CartLine).productId,
                quantity: Math.min(99, Math.max(1, Math.floor((x as CartLine).quantity))),
              })),
          );
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((productId: string, qty = 1) => {
    const q = Math.min(99, Math.max(1, Math.floor(qty)));
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === productId);
      if (i === -1) return [...prev, { productId, quantity: q }];
      const next = [...prev];
      next[i] = {
        ...next[i],
        quantity: Math.min(99, next[i].quantity + q),
      };
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.productId !== productId);
      const q = Math.min(99, Math.max(1, Math.floor(quantity)));
      const i = prev.findIndex((l) => l.productId === productId);
      if (i === -1) return [...prev, { productId, quantity: q }];
      const next = [...prev];
      next[i] = { ...next[i], quantity: q };
      return next;
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, add, remove, setQty, clear }),
    [lines, add, remove, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart yalnızca CartProvider içinde kullanılabilir.");
  return ctx;
}
