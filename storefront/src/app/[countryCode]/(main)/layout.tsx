import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import { CartProvider } from "@modules/cart/context/cart-context"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  // Await params in Next.js 16
  const resolvedParams = await props.params
  
  // Validate params
  const countryCode = resolvedParams?.countryCode && typeof resolvedParams.countryCode === 'string' 
    ? resolvedParams.countryCode.toLowerCase() 
    : 'us' // Fallback to 'us' if countryCode is missing

  return (
    <CartProvider>
      <Nav countryCode={countryCode} />
      {props.children}
      <Footer />
    </CartProvider>
  )
}
