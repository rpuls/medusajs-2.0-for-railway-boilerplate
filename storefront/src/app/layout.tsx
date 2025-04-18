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
        {/* Подключение шрифта Barlow Condensed */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans tracking-wide text-base antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
