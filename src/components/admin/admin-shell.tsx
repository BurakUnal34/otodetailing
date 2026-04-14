"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/urunler", label: "Ürünler" },
  { href: "/admin/siparisler", label: "Siparişler" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
      <aside className="w-full shrink-0 sm:w-56">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Yönetim
          </p>
          <nav className="space-y-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm transition",
                    active ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/giris" })}
            className="mt-3 w-full rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-rose-500/30 hover:text-rose-200"
          >
            Çıkış
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
