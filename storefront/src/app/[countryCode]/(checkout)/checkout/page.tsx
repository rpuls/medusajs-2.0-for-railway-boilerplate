import { Metadata } from "next"
import { notFound } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { BeginCheckoutTracker } from "@modules/checkout/components/begin-checkout-tracker"
import PerksBanner from "@modules/checkout/components/perks-banner"
import { enrichLineItems, retrieveCart, stripHeavyCartMetadataForRender } from "@lib/data/cart"
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
      <div className="mb-8 small:mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
          Secure checkout
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-primary)] small:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          Review your details, delivery, and payment — same look and feel as the
          rest of SC Prints.
        </p>
      </div>

      <PerksBanner perks={perks.perks} />


      <div className="grid grid-cols-1 gap-8 small:grid-cols-[1fr_min(100%,400px)] small:gap-x-10 small:items-start">
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-5 shadow-[0_4px_40px_rgba(26,26,46,0.08)] backdrop-blur-sm small:p-8">
          <Wrapper cart={cart}>
            <CheckoutForm cart={cart} customer={customer} />
          </Wrapper>
        </div>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
