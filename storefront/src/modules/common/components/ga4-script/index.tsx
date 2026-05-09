import Script from "next/script"

/**
 * Injects the GA4 base script + initial config into every page.
 * Renders nothing if NEXT_PUBLIC_GA_MEASUREMENT_ID isn't set, so dev
 * environments and previews without the env var stay quiet.
 *
 * The wrapper module at `@lib/analytics` is what every component
 * actually calls; this just bootstraps `window.gtag` and the
 * dataLayer so those calls have somewhere to land.
 */
export const Ga4Script = () => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: true,
            // Allow auto-send of standard ecommerce events from gtag.
            // The ones we fire manually use 'event' invocations in
            // the analytics module and don't conflict.
          });
        `}
      </Script>
    </>
  )
}
