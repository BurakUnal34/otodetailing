"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatus = "BEKLEMEDE" | "ODENDI" | "IPTAL";

const options: { value: OrderStatus; label: string }[] = [
  { value: "BEKLEMEDE", label: "Beklemede" },
  { value: "ODENDI", label: "Ödendi" },
  { value: "IPTAL", label: "İptal" },
];

export function OrderStatusSelect({ orderId, value }: { orderId: string; value: OrderStatus }) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [busy, setBusy] = useState(false);

  async function change(next: OrderStatus) {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
      credentials: "include",
    });
    setBusy(false);
    if (!res.ok) {
      alert("Durum güncellenemedi.");
      setCurrent(value);
      return;
    }
    setCurrent(next);
    router.refresh();
  }

  return (
    <select
      disabled={busy}
      value={current}
      onChange={(e) => change(e.target.value as OrderStatus)}
      className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
