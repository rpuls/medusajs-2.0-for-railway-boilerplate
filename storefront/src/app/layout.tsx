import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Hanken_Grotesk, Be_Vietnam_Pro } from "next/font/google"
import "styles/globals.css"

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-vietnam",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-mode="light" className={`${hankenGrotesk.variable} ${beVietnamPro.variable}`}>
      <body className="font-vietnam antialiased bg-kin-surface text-kin-on-surface">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
