import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  // Proves to Google Merchant Center and Search Console that this site is
  // yours, with the code they give for the "HTML tag" method. That method
  // works on a Railway subdomain, where you cannot add a DNS record. Read
  // at build time, which Railway runs again when the variable changes.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        {/* The UCP profile, for AI agents. See src/app/.well-known/ucp. */}
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
