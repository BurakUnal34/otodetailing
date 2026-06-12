/**
 * E-posta gönderim katmanı.
 *
 * Üretim için Resend (https://resend.com) önerilir. RESEND_API_KEY tanımlanmadığında
 * tüm `sendMail` çağrıları sessizce no-op olur ve loglanır; uygulama bu durumda da
 * çalışmaya devam eder.
 *
 * Not: Resend HTTP API kullanıldığı için ek bağımlılık gerekmez (fetch ile çağrılır).
 */

type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Müşteriye gönderilen siparişlerde reply-to olarak yöneticiye yönlendirmek için kullanılabilir. */
  replyTo?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}

export async function sendMail(input: SendMailInput): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY/RESEND_FROM tanımlı değil, e-posta atlandı:", input.subject);
    return { ok: false, reason: "not_configured" };
  }

  const to = Array.isArray(input.to) ? input.to : [input.to];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend hata:", res.status, detail);
      return { ok: false, reason: "api_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Resend ağ hatası:", err);
    return { ok: false, reason: "network_error" };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );
}

function trFromCents(cents: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(cents / 100);
}

export type OrderEmailItem = {
  productNameSnap: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderEmailPayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  totalCents: number;
  items: OrderEmailItem[];
  siteName: string;
  siteUrl: string;
};

export function renderOrderConfirmationEmail(p: OrderEmailPayload): { subject: string; html: string; text: string } {
  const subject = `${p.siteName} · Siparişiniz alındı (#${p.orderId.slice(0, 8).toUpperCase()})`;

  const itemsHtml = p.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 4px;border-bottom:1px solid #e5e7eb;">${escapeHtml(i.productNameSnap)}</td>
          <td style="padding:8px 4px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 4px;border-bottom:1px solid #e5e7eb;text-align:right;">${trFromCents(i.unitPriceCents * i.quantity)}</td>
        </tr>`,
    )
    .join("");

  const html = `
  <!doctype html>
  <html lang="tr">
    <body style="margin:0;padding:0;background:#0a0a0a;color:#1f2937;font-family:Inter,-apple-system,Segoe UI,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;background:#0a0a0a;color:#fff;">
                  <p style="margin:0;font-size:13px;color:#fbbf24;letter-spacing:.08em;text-transform:uppercase;font-weight:700;">${escapeHtml(p.siteName)}</p>
                  <p style="margin:4px 0 0;font-size:18px;font-weight:600;">Siparişiniz alındı</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 12px;font-size:14px;">Merhaba ${escapeHtml(p.customerName)},</p>
                  <p style="margin:0 0 16px;font-size:14px;line-height:1.55;">
                    Ödemeniz alındı, siparişiniz hazırlanmaya başlanacaktır. Aşağıdaki sipariş özetini saklayın;
                    teslimat süreci ile ilgili bildirimleri ayrıca ileteceğiz.
                  </p>
                  <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">Sipariş numarası</p>
                  <p style="margin:0 0 18px;font-size:14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(p.orderId)}</p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
                    <thead>
                      <tr>
                        <th align="left" style="padding:8px 4px;border-bottom:2px solid #111827;">Ürün</th>
                        <th align="center" style="padding:8px 4px;border-bottom:2px solid #111827;">Adet</th>
                        <th align="right" style="padding:8px 4px;border-bottom:2px solid #111827;">Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                      <tr>
                        <td colspan="2" style="padding:12px 4px;font-weight:700;">Toplam</td>
                        <td style="padding:12px 4px;text-align:right;font-weight:700;color:#b45309;">${trFromCents(p.totalCents)}</td>
                      </tr>
                    </tbody>
                  </table>

                  ${
                    p.shippingAddress
                      ? `<p style="margin:18px 0 4px;font-size:12px;color:#6b7280;">Teslimat adresi</p>
                         <p style="margin:0 0 4px;font-size:13px;line-height:1.55;">${escapeHtml(p.shippingAddress)}</p>`
                      : ""
                  }
                  ${
                    p.customerPhone
                      ? `<p style="margin:8px 0 4px;font-size:12px;color:#6b7280;">İletişim telefonu</p>
                         <p style="margin:0 0 16px;font-size:13px;">${escapeHtml(p.customerPhone)}</p>`
                      : ""
                  }

                  <p style="margin:18px 0 0;font-size:12px;color:#6b7280;line-height:1.55;">
                    Bu e-postayı bilgilendirme amaçlı aldınız. Sorularınız için bu maile yanıt verebilirsiniz.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:11px;text-align:center;">
                  <a href="${escapeHtml(p.siteUrl)}" style="color:#b45309;text-decoration:none;">${escapeHtml(p.siteName)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  const text =
    `Merhaba ${p.customerName},\n\n` +
    `Sipariş numaranız: ${p.orderId}\n\n` +
    p.items
      .map((i) => `- ${i.productNameSnap} x${i.quantity}  ${trFromCents(i.unitPriceCents * i.quantity)}`)
      .join("\n") +
    `\nToplam: ${trFromCents(p.totalCents)}\n\n` +
    (p.shippingAddress ? `Adres: ${p.shippingAddress}\n` : "") +
    `\nTeşekkürler,\n${p.siteName}\n${p.siteUrl}`;

  return { subject, html, text };
}

export function renderAdminNewOrderEmail(p: OrderEmailPayload): { subject: string; html: string; text: string } {
  const subject = `Yeni sipariş · ${p.customerName} · ${trFromCents(p.totalCents)}`;
  const items = p.items
    .map(
      (i) =>
        `<li>${escapeHtml(i.productNameSnap)} × ${i.quantity} — <strong>${trFromCents(i.unitPriceCents * i.quantity)}</strong></li>`,
    )
    .join("");
  const html = `
    <h2>Yeni sipariş alındı</h2>
    <p><strong>Müşteri:</strong> ${escapeHtml(p.customerName)} (${escapeHtml(p.customerEmail)})${
      p.customerPhone ? ` · ${escapeHtml(p.customerPhone)}` : ""
    }</p>
    ${p.shippingAddress ? `<p><strong>Adres:</strong> ${escapeHtml(p.shippingAddress)}</p>` : ""}
    <p><strong>Sipariş ID:</strong> <code>${escapeHtml(p.orderId)}</code></p>
    <ul>${items}</ul>
    <p><strong>Toplam:</strong> ${trFromCents(p.totalCents)}</p>
  `;
  const text =
    `Yeni sipariş\n` +
    `Müşteri: ${p.customerName} (${p.customerEmail})\n` +
    (p.customerPhone ? `Tel: ${p.customerPhone}\n` : "") +
    (p.shippingAddress ? `Adres: ${p.shippingAddress}\n` : "") +
    `Sipariş: ${p.orderId}\n` +
    p.items.map((i) => `- ${i.productNameSnap} x${i.quantity}`).join("\n") +
    `\nToplam: ${trFromCents(p.totalCents)}`;
  return { subject, html, text };
}
