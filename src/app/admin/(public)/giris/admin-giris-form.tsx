"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SITE_NAME } from "@/lib/site-config";

export function AdminGirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
        return;
      }
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-sm text-zinc-400 hover:text-white">
        ← Mağazaya dön
      </Link>
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
        <h1 className="text-lg font-bold text-white">Yönetici girişi</h1>
        <p className="mt-1 text-xs text-zinc-500">{SITE_NAME} paneli</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-xs text-zinc-400">
            E-posta
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              required
            />
          </label>
          <label className="block text-xs text-zinc-400">
            Şifre
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
              required
            />
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-brand-400 disabled:opacity-50"
          >
            {busy ? "Giriş…" : "Giriş yap"}
          </button>
        </form>
        <p className="mt-4 text-[11px] text-zinc-600">
          Yerel geliştirme: seed sonrası <span className="text-zinc-500">admin@otodetailing.local</span> /{" "}
          <span className="text-zinc-500">admin123</span>
        </p>
      </div>
    </div>
  );
}
