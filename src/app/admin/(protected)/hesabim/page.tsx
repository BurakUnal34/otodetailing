import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata = { title: "Hesabım" };
export const dynamic = "force-dynamic";

export default async function AdminHesabimPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-white">Hesabım</h1>
        <p className="mt-1 text-sm text-zinc-400">Yönetim hesabınızın güvenlik ayarları.</p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Profil</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 text-zinc-500">İsim</dt>
            <dd className="text-zinc-100">{session?.user?.name ?? "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-zinc-500">E-posta</dt>
            <dd className="text-zinc-100">{session?.user?.email ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Şifre değiştir</h2>
        <p className="mt-1 text-xs text-zinc-500">
          En az 10 karakter, mümkünse harf + rakam + sembol karışımı kullanın.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
