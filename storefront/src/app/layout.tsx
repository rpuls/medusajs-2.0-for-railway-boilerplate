import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans tracking-wider text-[17px] overflow-x-hidden bg-white">
        <main className="relative z-10">{props.children}</main>
      </body>
    </html>
  )
}
