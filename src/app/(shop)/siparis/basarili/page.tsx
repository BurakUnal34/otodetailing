import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sipariş alındı",
  robots: { index: false, follow: true },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Teşekkürler</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">Ödeme başarılı</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Siparişiniz kaydedildi. Stripe webhook ile onay ve stok güncellemesi tamamlandıysa durum
        yönetim panelinde <span className="text-zinc-200">Ödendi</span> olarak görünür.
      </p>
      {sp.session_id && (
        <p className="mt-4 break-all text-xs text-zinc-500">Oturum: {sp.session_id}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/urunler"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-brand-400"
        >
          Alışverişe devam
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:border-brand-500/40"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
