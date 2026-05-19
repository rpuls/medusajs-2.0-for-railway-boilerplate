import { Metadata } from "next"
import { notFound } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { BeginCheckoutTracker } from "@modules/checkout/components/begin-checkout-tracker"
import PerksBanner from "@modules/checkout/components/perks-banner"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { stripHeavyCartMetadataForRender } from "@lib/util/strip-cart-metadata"
import { applyDisplayPriceCorrectionToCart } from "@lib/util/apply-display-price-correction"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { getCustomerPerks } from "@lib/data/perks"

export const metadata: Metadata = {
  title: "Checkout",
}

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    // Strip heavy customizer metadata before passing to client components.
    // See stripHeavyCartMetadataForRender for the rationale.
    cart.items = stripHeavyCartMetadataForRender(
      enrichedItems
    ) as HttpTypes.StoreCartLineItem[]
    applyDisplayPriceCorrectionToCart(cart)
  }

  return cart
}

export default async function Checkout() {
  const cart = await fetchCart()
  const customer = await getCustomer()
  const perks = await getCustomerPerks()

  return (
    <div className="content-container py-8 small:py-10 pb-14">
      <BeginCheckoutTracker cart={cart} />
      <header className="mb-8 max-w-2xl border-l-4 border-[var(--brand-secondary)] pl-4 small:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Secure checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ui-fg-base small:text-4xl">
          Checkout
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ui-fg-subtle small:text-base">
          Review your delivery and payment details &mdash; we&apos;ll send a
          confirmation as soon as your order is placed.
        </p>
      </header>

      <PerksBanner perks={perks.perks} />

      <div className="mt-6 grid grid-cols-1 gap-8 small:grid-cols-[1fr_min(100%,400px)] small:items-start small:gap-x-10">
        <div className="rounded-2xl border border-ui-border-base bg-white p-5 shadow-sm small:p-8">
          <Wrapper cart={cart}>
            <CheckoutForm cart={cart} customer={customer} />
          </Wrapper>
        </div>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
