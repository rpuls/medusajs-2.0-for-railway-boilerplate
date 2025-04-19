import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { getCountryCode } from "@lib/localization/get-country-code"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import SideMenu from "@modules/layout/templates/side-menu"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export async function generateMetadata() {
  return {
    title: "GMORKL STORE",
    description: "Discover wearable art from Cologne.",
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const countryCode = getCountryCode()

  return (
    <html lang={countryCode}>
      <body className={inter.className}>
        <Nav />
        <SideMenu />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
