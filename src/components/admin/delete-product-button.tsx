"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        setBusy(true);
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
        setBusy(false);
        if (!res.ok) {
          alert("Silinemedi (sipariş geçmişi veya kısıt nedeniyle pasifleştirmeyi deneyin).");
          return;
        }
        router.refresh();
      }}
      className="text-xs text-rose-300 underline-offset-4 hover:underline disabled:opacity-50"
    >
      Sil
    </button>
  );
}
