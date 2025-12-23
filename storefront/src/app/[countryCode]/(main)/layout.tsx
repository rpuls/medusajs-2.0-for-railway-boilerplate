import { Metadata } from "next"
import { Suspense } from "react"

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

  // Nav includes CartButton which accesses cookies - wrap in Suspense
  // CartProvider is a client component that just manages state - no Suspense needed
  // Children are already wrapped in Suspense in root layout - don't double-wrap to avoid hydration errors
  return (
    <CartProvider>
      <Suspense fallback={
        <div className="sticky top-0 inset-x-0 z-50 h-20 bg-background-base animate-pulse" />
      }>
        <Nav countryCode={countryCode} />
      </Suspense>
      {props.children}
      <Footer />
    </CartProvider>
  )
}
