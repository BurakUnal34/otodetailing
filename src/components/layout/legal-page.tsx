import type { ReactNode } from "react";

export function LegalPage({
  title,
  updatedAt,
  intro,
  children,
}: {
  title: string;
  updatedAt: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-zinc-800 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Yasal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-xs text-zinc-500">Son güncelleme: {updatedAt}</p>
        {intro && <div className="mt-4 text-sm leading-relaxed text-zinc-400">{intro}</div>}
      </header>
      <article className="legal-body mt-8 space-y-6 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
        {children}
      </article>
    </div>
  );
}
