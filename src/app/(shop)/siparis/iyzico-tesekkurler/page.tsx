import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartAfterOrder } from "@/components/shop/clear-cart-after-order";

export const metadata: Metadata = {
  title: "Sipariş onayı (iyzico)",
  robots: { index: false, follow: false },
};

export default async function IyzicoTesekkurlerPage({
  searchParams,
}: {
  searchParams?: Promise<{ orderId?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const orderId = sp.orderId?.trim();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <ClearCartAfterOrder />
      <h1 className="text-2xl font-bold text-white">Teşekkürler</h1>
      <p className="mt-3 text-sm text-zinc-300">
        Ödemeniz iyzico üzerinden alındı. Siparişiniz işleme alınacaktır.
      </p>
      {orderId && (
        <p className="mt-4 break-all text-xs text-zinc-500">Sipariş: {orderId}</p>
      )}
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-brand-400"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
