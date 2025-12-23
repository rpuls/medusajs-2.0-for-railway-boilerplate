import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import dynamicImport from "next/dynamic"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

// Lazy load checkout summary (heavy component)
const CheckoutSummary = dynamicImport(
  () => import("@modules/checkout/templates/checkout-summary"),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: "Checkout",
}

// Checkout is dynamic (requires cart data)
// MIGRATED: Removed export const dynamic = "force-dynamic" (incompatible with Cache Components)
// TODO: Will add <Suspense> boundary after analyzing build errors (checkout is dynamic by default)

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

// Checkout content - user-specific, should NOT be cached
async function CheckoutContent() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </Wrapper>
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <CheckoutSummary cart={cart} />
      </Suspense>
    </div>
  )
}

export default async function Checkout() {
  // Checkout is always dynamic - wrap in Suspense to defer rendering
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
