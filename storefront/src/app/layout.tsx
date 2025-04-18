import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className="font-sans">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-base tracking-wide antialiased">
        {props.children}
      </body>
    </html>
  )
}
