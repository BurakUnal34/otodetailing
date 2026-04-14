"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

/** Başarılı ödeme sonrası sayfada sepeti temizler. */
export function ClearCartAfterOrder() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
