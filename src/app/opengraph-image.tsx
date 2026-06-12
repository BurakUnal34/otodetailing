import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

export const alt = `${SITE_NAME} — Profesyonel araç bakım ürünleri`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.18), transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #1f1d1a 100%)",
          color: "#fafafa",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 18,
              background: "linear-gradient(135deg, #fbbf24 0%, #b45309 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0a0a",
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            OD
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 18,
                color: "#fbbf24",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Profesyonel araç bakımı
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{SITE_NAME}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Temizlik, koruma ve parlaklık için seçilmiş ürünler.
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a3a3a3",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                background: "#fbbf24",
                color: "#0a0a0a",
                padding: "12px 22px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              Güvenli ödeme · Hızlı kargo
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#737373", letterSpacing: "0.06em" }}>
            ototdetailing.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
