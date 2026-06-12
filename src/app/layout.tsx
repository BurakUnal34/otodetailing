import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/components/cart/cart-provider";
import { GoogleAnalytics } from "@/components/layout/google-analytics";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { rootMetadataExtras, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Profesyonel araç bakım ürünleri`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  ...rootMetadataExtras(),
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        <Providers>
          <CartProvider>
            {children}
            <WhatsAppFloat />
          </CartProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
