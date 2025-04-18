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
        {/* Подключение шрифта Barlow Condensed */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans tracking-wide text-base antialiased">
        {/* Хедер */}
        <Nav />

        {/* Основной контент */}
        <main className="relative min-h-screen">{children}</main>

        {/* Футер */}
        <Footer />
      </body>
    </html>
  )
}
