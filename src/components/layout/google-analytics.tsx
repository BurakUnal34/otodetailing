import Script from "next/script";

/**
 * Google Analytics 4 — yalnızca NEXT_PUBLIC_GA_MEASUREMENT_ID tanımlandığında render edilir
 * ve yalnızca production'da yüklenir. Diğer durumlarda hiçbir tracker yüklenmez.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id) return null;
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
