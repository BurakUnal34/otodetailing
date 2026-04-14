import type { Metadata } from "next";
import { CartCheckout } from "@/components/shop/cart-checkout";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: false },
};

export default function SepetPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-white">Sepet</h1>
      <p className="mt-2 text-sm text-zinc-400">Ürünleri onaylayıp güvenli ödeme ile siparişinizi tamamlayın.</p>
      <div className="mt-8">
        <CartCheckout />
      </div>
    </div>
  );
}
