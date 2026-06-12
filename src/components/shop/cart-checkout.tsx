"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatTryFromCents } from "@/lib/money";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
};

export function CartCheckout() {
  const { lines, setQty, remove, clear } = useCart();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const formMountedAt = useRef<number>(Date.now());

  const provider = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "stripe").toLowerCase();
  const isIyzico = provider === "iyzico";
  const checkoutEndpoint = isIyzico ? "/api/checkout-iyzico" : "/api/checkout";
  const providerLabel = isIyzico ? "iyzico" : "Stripe";

  const ids = useMemo(() => lines.map((l) => l.productId), [lines]);

  const loadProducts = useCallback(async () => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/shop/cart-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Yüklenemedi");
      const data = (await res.json()) as { products: ProductRow[] };
      setProducts(data.products ?? []);
    } catch {
      setLoadError("Ürün bilgileri alınamadı.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const totalCents = useMemo(() => {
    let sum = 0;
    for (const line of lines) {
      const p = byId.get(line.productId);
      if (p) sum += p.priceCents * line.quantity;
    }
    return sum;
  }, [lines, byId]);

  const missing = useMemo(
    () => lines.some((l) => !byId.has(l.productId)),
    [lines, byId],
  );

  const phoneOk = useMemo(() => phone.replace(/\D/g, "").length >= 10, [phone]);
  const addressOk = useMemo(() => address.trim().length >= 10, [address]);
  const identityOk = !isIyzico || /^\d{11}$/.test(identityNumber.trim());
  const canPay =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phoneOk &&
    addressOk &&
    identityOk &&
    acceptsTerms &&
    !missing &&
    lines.length > 0;

  async function checkout() {
    setCheckoutError(null);
    if (!name.trim() || !email.trim() || !phoneOk || address.trim().length < 10) {
      setCheckoutError("Ad soyad, e-posta, telefon (en az 10 rakam) ve ev / teslimat adresi (en az 10 karakter) zorunludur.");
      return;
    }
    if (!acceptsTerms) {
      setCheckoutError("Devam etmek için Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme&apos;yi onaylayın.");
      return;
    }
    if (honeypotRef.current?.value) {
      setCheckoutError("İstek geçersiz.");
      return;
    }
    if (Date.now() - formMountedAt.current < 1500) {
      setCheckoutError("Lütfen formu doldurduktan sonra biraz bekleyip tekrar deneyin.");
      return;
    }
    if (isIyzico && !identityOk) {
      setCheckoutError("iyzico ödemesi için 11 haneli T.C. kimlik numarası zorunludur.");
      return;
    }
    setCheckoutBusy(true);
    try {
      const res = await fetch(checkoutEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: address.trim(),
          ...(isIyzico ? { identityNumber: identityNumber.trim() } : {}),
          acceptsTerms: true,
          hp: honeypotRef.current?.value ?? "",
          formAgeMs: Date.now() - formMountedAt.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok) {
        setCheckoutError(data?.error ?? "Ödeme başlatılamadı.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutError("Ödeme bağlantısı alınamadı.");
    } catch {
      setCheckoutError("Bağlantı hatası.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <p className="text-sm text-zinc-300">Sepetiniz boş.</p>
        <Link
          href="/urunler"
          className="mt-4 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-brand-400"
        >
          Ürünlere göz at
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Ürünler</h2>
        {loading && <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>}
        {loadError && <p className="mt-3 text-sm text-rose-300">{loadError}</p>}
        {!loading && missing && (
          <p className="mt-3 text-sm text-amber-200">
            Bazı ürünler artık mevcut değil; satırı kaldırın veya miktarı güncelleyin.
          </p>
        )}
        <ul className="mt-4 divide-y divide-zinc-800">
          {lines.map((line) => {
            const p = byId.get(line.productId);
            if (!p) {
              return (
                <li key={line.productId} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <span className="text-sm text-zinc-500">Bilinmeyen ürün</span>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    className="text-xs text-rose-300 underline"
                  >
                    Kaldır
                  </button>
                </li>
              );
            }
            const sub = p.priceCents * line.quantity;
            return (
              <li key={line.productId} className="flex flex-wrap gap-4 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-600">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/urun/${p.slug}`} className="text-sm font-semibold text-white hover:text-brand-300">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">{formatTryFromCents(p.priceCents)} × {line.quantity}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                      Adet
                      <input
                        type="number"
                        min={1}
                        max={Math.min(99, p.stock)}
                        value={line.quantity}
                        onChange={(e) => setQty(line.productId, Number.parseInt(e.target.value, 10) || 1)}
                        className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-white"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="text-xs text-rose-300 underline"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold text-brand-300">{formatTryFromCents(sub)}</div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => {
              clear();
              void loadProducts();
            }}
            className="text-xs text-zinc-500 underline hover:text-zinc-300"
          >
            Sepeti temizle
          </button>
          <p className="text-base font-bold text-white">
            Toplam: <span className="text-brand-300">{formatTryFromCents(totalCents)}</span>
          </p>
        </div>
      </div>

      <form
        className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void checkout();
        }}
      >
        <h2 className="text-lg font-semibold text-white">İletişim ve teslimat</h2>
        <p className="mt-1 text-sm text-zinc-500">Ödeme için Stripe sayfasında da doğrulama yapılır.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-zinc-400 sm:col-span-2">
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
          <label className="block text-xs text-zinc-400 sm:col-span-2">
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
          <label className="block text-xs text-zinc-400 sm:col-span-2">
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
          <label className="block text-xs text-zinc-400 sm:col-span-2">
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
          {isIyzico && (
            <label className="block text-xs text-zinc-400 sm:col-span-2">
              T.C. Kimlik No <span className="text-rose-400">*</span>
              <input
                inputMode="numeric"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                placeholder="11 haneli kimlik numarası"
                required
                pattern="\d{11}"
                maxLength={11}
              />
            </label>
          )}
          {/* Honeypot — gerçek kullanıcılar görmez; botların doldurması beklenir */}
          <div aria-hidden="true" className="hidden">
            <label>
              Web sitesi
              <input
                ref={honeypotRef}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                name="website"
                defaultValue=""
              />
            </label>
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={acceptsTerms}
            onChange={(e) => setAcceptsTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
            required
          />
          <span>
            <Link
              href="/sayfa/mesafeli-satis-sozlesmesi"
              target="_blank"
              className="font-semibold text-brand-300 underline-offset-2 hover:underline"
            >
              Mesafeli Satış Sözleşmesi
            </Link>
            &apos;ni,{" "}
            <Link
              href="/sayfa/iade-ve-cayma"
              target="_blank"
              className="font-semibold text-brand-300 underline-offset-2 hover:underline"
            >
              Ön Bilgilendirme Formu&apos;nu (İade / Cayma)
            </Link>
            {" "}
            ve{" "}
            <Link
              href="/sayfa/kvkk"
              target="_blank"
              className="font-semibold text-brand-300 underline-offset-2 hover:underline"
            >
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum, anladım ve kabul ediyorum.
          </span>
        </label>

        {checkoutError && <p className="mt-4 text-sm text-rose-300">{checkoutError}</p>}
        <button
          type="submit"
          disabled={checkoutBusy || loading || !canPay}
          className="mt-6 w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {checkoutBusy ? "Yönlendiriliyor…" : `Ödemeye geç (${providerLabel})`}
        </button>
        <p className="mt-3 text-xs text-zinc-600">
          Ödemeyi tamamladığınızda sözleşmeyi kabul etmiş sayılırsınız. Onay e-postası sipariş sonrası
          adresinize gönderilir.
        </p>
      </form>
    </div>
  );
}
