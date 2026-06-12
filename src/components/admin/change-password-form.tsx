"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next.length < 10) {
      setError("Yeni şifre en az 10 karakter olmalı.");
      return;
    }
    if (next !== confirm) {
      setError("Yeni şifre tekrarı eşleşmiyor.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
          confirmNewPassword: confirm,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Şifre değiştirilemedi.");
        return;
      }
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:max-w-md">
      <label className="block text-xs text-zinc-400">
        Mevcut şifre
        <input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-xs text-zinc-400">
        Yeni şifre
        <input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={10}
          className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block text-xs text-zinc-400">
        Yeni şifre tekrar
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={10}
          className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
        />
      </label>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {success && <p className="text-sm text-emerald-300">Şifre güncellendi.</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-2 w-fit rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-brand-400 disabled:opacity-50"
      >
        {busy ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </button>
    </form>
  );
}
