import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { getTranslations, getTranslation } from "@lib/i18n/server"

export async function generateMetadata({ params }: { params: Promise<{ countryCode: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const normalizedCountryCode = typeof resolvedParams?.countryCode === 'string' 
    ? resolvedParams.countryCode.toLowerCase() 
    : 'us'
  
  // Get translations for metadata
  const translations = await getTranslations(normalizedCountryCode)
  const siteName = getTranslation(translations, "metadata.siteName")
  const cartTitle = getTranslation(translations, "metadata.cart.title")
  const cartDescription = getTranslation(translations, "metadata.cart.description")
  
  return {
    title: `${cartTitle} | ${siteName}`,
    description: cartDescription,
  robots: {
    index: false, // Cart pages should not be indexed
    follow: false,
  },
  }
}

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

// Cart content - user-specific, should NOT be cached
async function CartContent() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}

export default async function Cart({ params }: { params: Promise<{ countryCode: string }> }) {
  await params // Await params in Next.js 16 (even if not used)
  
  // Cart is always dynamic - wrap in Suspense to defer rendering
  return (
    <Suspense fallback={
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    }>
      <CartContent />
    </Suspense>
  )
}
