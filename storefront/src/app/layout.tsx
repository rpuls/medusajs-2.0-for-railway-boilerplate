import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "styles/globals.css"
import { ViewTransitions } from "next-view-transitions"
import ConditionalCursorDot from "@modules/layout/components/conditional-cursor-dot"
import { ChatWidget } from "@modules/common/components/chat-widget"
import { Ga4Script } from "@modules/common/components/ga4-script"
import { PostHogProvider } from "@modules/common/components/posthog-provider"

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  display: "swap", 
})

export const viewport: Viewport = {
  themeColor: "#EEEEEE",
  width: "device-width",
  initialScale: 1,
}

// NEW: Upgraded SEO & Social Media sharing configuration
export const metadata: Metadata = {
  metadataBase: new URL(buildAbsoluteUrl("/")),
  title: {
    template: `%s | ${SEO.siteName}`,
    default: `${SEO.siteName} | Custom Apparel & Merch`,
  },
  description: SEO.siteDescription,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "custom apparel Australia",
    "screen printing",
    "embroidery",
    "digital transfers",
    "uv printing",
    "uniform branding",
    "bulk merch",
  ],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "oY0Zolz7R7nfAyd2YQ4uLCrKxdIi0dXVFZt6KVbJR28",
  },
  openGraph: {
    type: "website",
    locale: SEO.locale,
    siteName: SEO.siteName,
    url: buildAbsoluteUrl("/"),
    title: `${SEO.siteName} | Custom Apparel & Merch`,
    description: SEO.siteDescription,
    images: [
      {
        url: SEO.ogImage,
        width: 768,
        height: 1024,
        alt: "SC Prints logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SEO.siteName} | Custom Apparel & Merch`,
    description: SEO.siteDescription,
    images: [SEO.ogImage],
  },
}

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO.siteName,
  url: buildAbsoluteUrl("/"),
  logo: buildAbsoluteUrl(SEO.ogImage),
  email: SEO.contactEmail,
  telephone: SEO.contactPhone,
  address: {
    "@type": "PostalAddress",
    addressCountry: SEO.country,
  },
  areaServed: SEO.country,
}

const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SEO.siteName,
  image: buildAbsoluteUrl(SEO.ogImage),
  url: buildAbsoluteUrl("/"),
  email: SEO.contactEmail,
  telephone: SEO.contactPhone,
  address: {
    "@type": "PostalAddress",
    addressCountry: SEO.country,
  },
  areaServed: {
    "@type": "Country",
    name: "Australia",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en" data-mode="light" className="scroll-smooth">
        <body
          className={`${plusJakartaSans.className} antialiased selection:bg-[#FF2E63] selection:text-[#EEEEEE]`}
        >
          <Ga4Script />
          <ChatWidget />
          <PostHogProvider>
          <ConditionalCursorDot />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([organizationStructuredData, localBusinessStructuredData]),
            }}
          />
          <main className="relative min-h-dvh bg-[var(--brand-background)] text-[var(--brand-primary)]">
            {props.children}
          </main>
          </PostHogProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}