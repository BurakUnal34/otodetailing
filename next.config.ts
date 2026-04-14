import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Sharp native modül; paketlenince Turbopack/Webpack bazen bozuyor — yükleme ve diğer route’ları etkileyebilir. */
  serverExternalPackages: ["sharp"],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    /** Next.js 16 öncesi uyarı: kullanılan quality değerleri burada tanımlı olmalı */
    qualities: [75, 80, 85, 88, 90],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/**" },
      /** Vercel Blob ürün görselleri (*.public.blob.vercel-storage.com) */
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
