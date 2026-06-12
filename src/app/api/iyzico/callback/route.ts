import { NextResponse } from "next/server";
import { fulfillIyzicoOrderFromToken } from "@/lib/fulfill-iyzico-order";
import { getSiteUrl } from "@/lib/site-config";

/**
 * iyzico, ödeme tamamlandığında callbackUrl'e POST atar (form-urlencoded `token` alanıyla).
 * Burada token'ı doğrulayıp siparişi `ODENDI`'ye çekiyor; ardından kullanıcıyı
 * /siparis/iyzico-tesekkurler sayfasına yönlendiriyoruz.
 */
async function handle(req: Request, getToken: () => Promise<string | null>) {
  const base = getSiteUrl().replace(/\/$/, "");
  const token = await getToken();
  if (!token) {
    return NextResponse.redirect(`${base}/sepet?iyzico=missing-token`, 303);
  }

  const result = await fulfillIyzicoOrderFromToken(token);
  if (!result.ok) {
    const reason =
      result.code === "unpaid"
        ? "unpaid"
        : result.code === "no_iyzico"
          ? "config"
          : result.code === "stock"
            ? "stock"
            : "failed";
    return NextResponse.redirect(`${base}/sepet?iyzico=${reason}`, 303);
  }

  return NextResponse.redirect(
    `${base}/siparis/iyzico-tesekkurler?orderId=${encodeURIComponent(result.orderId)}`,
    303,
  );
  // not: `req` kullanılmıyor; readability için imzada tutuldu
  void req;
}

export async function POST(req: Request) {
  return handle(req, async () => {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await req.formData().catch(() => null);
      const t = form?.get("token");
      return typeof t === "string" && t.length > 0 ? t : null;
    }
    if (ct.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as { token?: string } | null;
      return body?.token && typeof body.token === "string" ? body.token : null;
    }
    return null;
  });
}

export async function GET(req: Request) {
  return handle(req, async () => {
    const url = new URL(req.url);
    return url.searchParams.get("token");
  });
}
