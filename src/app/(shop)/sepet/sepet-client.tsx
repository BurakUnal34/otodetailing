"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatTryFromCents } from "@/lib/money";

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
};

export function SepetClient({ products }: { products: ProductLite[] }) {
  const { lines, setQty, remove, clear } = useCart();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const rows = useMemo(() => {
    return lines
      .map((l) => {
        const p = byId.get(l.productId);
        return p ? { ...l, product: p } : null;
      })
      .filter(Boolean) as { productId: string; quantity: number; product: ProductLite }[];
  }, [lines, byId]);

  const unknownLines = useMemo(
    () => lines.filter((l) => !byId.has(l.productId)).length,
    [lines, byId],
  );

  const total = useMemo(() => {
    return rows.reduce((sum, r) => sum + r.product.priceCents * r.quantity, 0);
  }, [rows]);

  const canPay =
    rows.length > 0 &&
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, "").length >= 10 &&
    address.trim().length >= 10 &&
    !rows.some((r) => r.quantity > r.product.stock);

  async function pay() {
    setError(null);
    if (rows.length === 0) {
      setError("Sepet boş.");
      return;
    }
    const phoneOk = phone.replace(/\D/g, "").length >= 10;
    if (!email.trim() || !name.trim() || !phoneOk || address.trim().length < 10) {
      setError("E-posta, ad soyad, telefon (en az 10 rakam) ve ev / teslimat adresi (en az 10 karakter) zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: rows.map((r) => ({ productId: r.productId, quantity: r.quantity })),
          customerEmail: email.trim(),
          customerName: name.trim(),
          customerPhone: phone.trim(),
          shippingAddress: address.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Ödeme başlatılamadı.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Ödeme bağlantısı alınamadı.");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {unknownLines > 0 && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Sepetinizde artık satışta olmayan ürünler var; bunlar listede gösterilmez.
          </p>
        )}
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-400">Sepetiniz boş. Ürün sayfalarından ekleyebilirsiniz.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/30">
            {rows.map((r) => (
              <li key={r.productId} className="flex gap-4 p-4">
                <Link
                  href={`/urun/${r.product.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900"
                >
                  {r.product.imageUrl ? (
                    <Image src={r.product.imageUrl} alt={r.product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-500">—</div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/urun/${r.product.slug}`} className="font-medium text-white hover:text-brand-300">
                    {r.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">{formatTryFromCents(r.product.priceCents)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                      Adet
                      <input
                        type="number"
                        min={1}
                        max={Math.min(99, r.product.stock)}
                        value={r.quantity}
                        onChange={(e) => setQty(r.productId, Number(e.target.value))}
                        className="w-20 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-white"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(r.productId)}
                      className="text-xs text-zinc-400 underline-offset-4 hover:text-white hover:underline"
                    >
                      Kaldır
                    </button>
                  </div>
                  {r.quantity > r.product.stock && (
                    <p className="mt-2 text-xs text-amber-300">Stoktan fazla adet seçtiniz.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => clear()}
            className="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            Sepeti temizle
          </button>
        )}
      </div>

      <aside className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="text-sm font-semibold text-white">Ödeme bilgileri</h2>
        <p className="text-xs text-zinc-400">
          Stripe Checkout ile güvenli ödeme. Webhook ile sipariş onayı ve stok düşümü yapılır.
        </p>
        <div className="space-y-3">
          <label className="block text-xs text-zinc-400">
            E-posta <span className="text-rose-400">*</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Ad soyad <span className="text-rose-400">*</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Telefon <span className="text-rose-400">*</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              autoComplete="tel"
              placeholder="05xx xxx xx xx"
              required
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Ev / teslimat adresi <span className="text-rose-400">*</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              autoComplete="street-address"
              placeholder="Mahalle, sokak, bina no, ilçe / il"
              required
              minLength={10}
            />
          </label>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
          <span className="text-zinc-400">Ara toplam</span>
          <span className="font-semibold text-white">{formatTryFromCents(total)}</span>
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="button"
          disabled={loading || !canPay}
          onClick={pay}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Yönlendiriliyor..." : "Ödemeye geç"}
        </button>
      </aside>
    </div>
  );
}
