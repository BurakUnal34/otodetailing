import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartAfterOrder } from "@/components/shop/clear-cart-after-order";
import { fulfillStripeOrderFromSession } from "@/lib/fulfill-stripe-order";

export const metadata: Metadata = {
  title: "Sipariş onayı",
  robots: { index: false, follow: false },
};

export default async function TesekkurlerPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const sessionId = sp.session_id?.trim();

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-white">Oturum bulunamadı</h1>
        <p className="mt-3 text-sm text-zinc-400">Ödeme sonrası yönlendirme eksik veya süresi dolmuş olabilir.</p>
        <Link href="/sepet" className="mt-6 inline-block text-sm font-medium text-brand-300 hover:text-brand-200">
          Sepete dön
        </Link>
      </div>
    );
  }

  const result = await fulfillStripeOrderFromSession(sessionId);

  if (!result.ok) {
    const msg =
      result.code === "no_stripe"
        ? "Ödeme doğrulaması yapılandırılmamış."
        : result.code === "unpaid"
          ? "Ödeme henüz onaylanmadı veya iptal edildi."
          : "Sipariş kaydı doğrulanamadı.";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-rose-200">İşlem tamamlanamadı</h1>
        <p className="mt-3 text-sm text-zinc-400">{msg}</p>
        <Link href="/sepet" className="mt-6 inline-block text-sm font-medium text-brand-300 hover:text-brand-200">
          Sepete dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <ClearCartAfterOrder />
      <h1 className="text-2xl font-bold text-white">Teşekkürler</h1>
      <p className="mt-3 text-sm text-zinc-300">
        {result.alreadyPaid
          ? "Bu sipariş zaten kaydedilmiş."
          : "Ödemeniz alındı. Siparişiniz işleme alınacaktır."}
      </p>
      <Link href="/" className="mt-8 inline-block rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-brand-400">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
