import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #18181b 0%, #0a0a0a 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 132,
            height: 132,
            borderRadius: 32,
            background: "linear-gradient(135deg, #fbbf24 0%, #b45309 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0a0a0a",
            fontSize: 70,
            fontWeight: 900,
            letterSpacing: "-0.06em",
          }}
        >
          OD
        </div>
      </div>
    ),
    size,
  );
}
