// src/app/layout.tsx

import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        {/* Variable Barlow Condensed — подключение через Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wdth,wght@75..100,100..900&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <title>GMORKL STORE</title>
      </head>
      <body className="font-sans tracking-wide text-base antialiased bg-white text-[#111827]">
        <Nav />
        <main className="relative min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
