"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { parseTryToCents } from "@/lib/money";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };

type Mode = { type: "create" } | { type: "edit"; id: string };

export function ProductForm({
  categories,
  mode,
  initial,
}: {
  categories: Category[];
  mode: Mode;
  initial?: {
    name: string;
    slug: string;
    description: string;
    priceTry: string;
    stock: number;
    imageUrl: string;
    categoryId: string;
    active: boolean;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceTry, setPriceTry] = useState(initial?.priceTry ?? "");
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoSlug = useMemo(() => slugify(name), [name]);

  async function onImageFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
           const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const raw = await res.text();
      type UploadJson = { url?: string; error?: string; warning?: string };
      let data: UploadJson | null = null;
      try {
        data = raw ? (JSON.parse(raw) as UploadJson) : null;
      } catch {
        setError(
          res.ok
            ? "Sunucu yanıtı okunamadı."
            : `Sunucu hatası (${res.status}). Sayfayı yenileyip tekrar deneyin.`,
        );
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? `Görsel yüklenemedi (${res.status}).`);
        return;
      }
      if (data?.url) setImageUrl(data.url);
    } catch {
      setError("Görsel yüklenirken bağlantı hatası.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function submit() {
    setError(null);
    const priceCents = parseTryToCents(priceTry);
    if (!name.trim()) {
      setError("Ürün adı zorunludur.");
      return;
    }
    if (!description.trim()) {
      setError("Açıklama zorunludur.");
      return;
    }
    if (priceCents === null) {
      setError("Geçerli bir fiyat girin (ör. 349,90).");
      return;
    }
    const stockNum = Number.parseInt(stock, 10);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setError("Geçerli bir stok girin.");
      return;
    }
    if (!categoryId) {
      setError("Kategori seçin.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() ? slug.trim() : autoSlug,
      description: description.trim(),
      priceCents,
      stock: stockNum,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      categoryId,
      active,
    };

    setLoading(true);
    try {
      const url = mode.type === "create" ? "/api/admin/products" : `/api/admin/products/${mode.id}`;
      const method = mode.type === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Kayıt başarısız.");
        return;
      }
      router.push("/admin/urunler");
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-zinc-400 sm:col-span-2">
          Ürün adı
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-zinc-400 sm:col-span-2">
          URL slug (boş bırakılırsa otomatik)
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={autoSlug}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-zinc-400">
          Kategori
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-400">
          Fiyat (TRY)
          <input
            value={priceTry}
            onChange={(e) => setPriceTry(e.target.value)}
            placeholder="349,90"
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs text-zinc-400">
          Stok
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Yayında (satışa açık)
        </label>
        <label className="block text-xs text-zinc-400 sm:col-span-2">
          Görsel (URL veya dosya)
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... veya yüklenen dosya yolu"
              className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onImageFileChange}
            />
            <button
              type="button"
              disabled={loading || uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-md border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:border-brand-500/50 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingImage ? "Yükleniyor…" : "Dosya yükle"}
            </button>
          </div>
          <span className="mt-1 block text-[11px] text-zinc-600">
            JPEG, PNG, WebP veya GIF · en fazla 5 MB. JPG/PNG/WebP sunucuda WebP&apos;e dönüştürülür.
          </span>
        </label>
        <label className="block text-xs text-zinc-400 sm:col-span-2">
          Açıklama
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={submit}
        className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-brand-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );
}
