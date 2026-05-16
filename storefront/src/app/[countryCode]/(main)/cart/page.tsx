import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { stripHeavyCartMetadataForRender } from "@lib/util/strip-cart-metadata"
import { applyDisplayPriceCorrectionToCart } from "@lib/util/apply-display-price-correction"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

const fetchCart = async () => {
  try {
    const cart = await retrieveCart()

    if (!cart) {
      return null
    }

    if (cart?.items?.length) {
      const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
      // Strip heavy customizer metadata (sideLayouts, prints, artifacts, etc.)
      // before passing to client components — large carts (100+ customized
      // lines) otherwise blow the RSC payload and the page errors out with
      // "Something went wrong loading your cart". Backend keeps the full
      // metadata; re-edit flows refetch it on demand.
      cart.items = stripHeavyCartMetadataForRender(
        enrichedItems
      ) as HttpTypes.StoreCartLineItem[]
      applyDisplayPriceCorrectionToCart(cart)

      // Diagnostic + serialization sanitization in one pass.
      //
      // The cart page has been erroring with "Server Components render" for
      // multiple iterations. PostHog only shows Next.js's production-omitted
      // generic message, so we can't see the real stack. One common cause of
      // RSC render errors is a non-serializable value on a client-component
      // prop — BigInt, Symbol, function, Date with methods, or a circular
      // reference. JSON.stringify will throw on those (which we log), and
      // JSON.parse(JSON.stringify(...)) silently drops anything that
      // survived. That gives us:
      //   - Visible log line showing serialized size + item count
      //   - An exception in logs if JSON.stringify itself can't handle it
      //   - A sanitized cart object that's guaranteed RSC-safe (passes only
      //     plain JSON-compatible values to client components)
      // If the cart starts loading after this lands, the original issue was
      // a non-JSON value somewhere on the cart object.
      try {
        const serialized = JSON.stringify(cart)
        // eslint-disable-next-line no-console
        console.info(
          `[cart-page-diag] items=${cart.items.length} serialized=${(
            Buffer.byteLength(serialized, "utf-8") /
            1024
          ).toFixed(1)}KB cart_id=${cart.id}`
        )
        // Hand back the JSON-roundtripped cart so any non-serializable
        // values (functions, Symbols, BigInt, class instances with custom
        // toJSON) are dropped before they reach client components.
        return JSON.parse(serialized) as HttpTypes.StoreCart
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[cart-page-diag] serialize-cart failed:", e)
        // Fall back to the raw cart — at least the original error stack
        // gets through. If JSON.stringify threw, we'll see that error
        // class/message in Vercel logs instead of the generic RSC mask.
      }
    }

    return cart
  } catch (err) {
    console.error("[cart/page] fetchCart threw:", err)
    return null
  }
}

export default async function Cart({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const cart = await fetchCart()
  const customer = await getCustomer()

  // Bisect mode — /au/cart?debug=<level> renders progressively simpler
  // versions of the cart page so we can isolate which component throws
  // during hydration. Server log shows the function returned 200, so the
  // bug is in client-side render. Remove this block once isolated.
  const params = searchParams ? await searchParams : undefined
  const debugLevel = params?.debug
  if (typeof debugLevel === "string") {
    const itemCount = cart?.items?.length ?? 0
    if (debugLevel === "0") {
      // Level 0: pure server render. No client components at all. If THIS
      // errors, the issue is in the data fetch / serialization path.
      return (
        <div className="content-container py-10">
          <h1 className="text-xl font-semibold">Debug 0 — server only</h1>
          <p className="mt-2 text-sm">Cart loaded: {itemCount} items</p>
          <p className="mt-1 text-xs text-ui-fg-subtle">cart_id={cart?.id ?? "(none)"}</p>
        </div>
      )
    }
    if (debugLevel === "1") {
      // Level 1: just dump cart JSON in a <pre>. Still server only — proves
      // the cart data itself can serialize and round-trip with no client component.
      return (
        <div className="content-container py-10">
          <h1 className="text-xl font-semibold">Debug 1 — cart JSON</h1>
          <pre className="mt-2 text-[10px] overflow-auto max-h-[80vh] bg-ui-bg-subtle p-3 rounded">
            {JSON.stringify(cart, null, 2).slice(0, 50_000)}
          </pre>
        </div>
      )
    }
    if (debugLevel === "2") {
      // Level 2: render CartTemplate but cart=null so the empty-cart branch
      // fires (no item rendering, no Summary). If this works, the issue is
      // in one of ItemsTemplate / Summary / AggregatedTierBanner.
      return <CartTemplate cart={null} customer={customer} />
    }
  }

  return <CartTemplate cart={cart} customer={customer} />
}
