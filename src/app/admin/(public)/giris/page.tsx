import { Suspense } from "react";
import { AdminGirisForm } from "./admin-giris-form";

export default function AdminGirisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">Yükleniyor…</div>
      }
    >
      <AdminGirisForm />
    </Suspense>
  );
}
