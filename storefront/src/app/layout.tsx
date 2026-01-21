import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "styles/globals.css"

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={bricolageGrotesque.variable}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
