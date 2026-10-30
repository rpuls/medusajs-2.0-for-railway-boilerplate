import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { getCustomer } from "@lib/data/customer"
import { UCP_CANCELED_KEY } from "@lib/ucp/ucp"
import { getRequestOrigin } from "@lib/util/env"
import { activateCart } from "@lib/util/server-cart"
import { HttpTypes } from "@medusajs/types"
import { NextResponse } from "next/server"

/**
 * The UCP checkout `continue_url`: an AI agent built this cart, and the
 * shopper opens it here to choose delivery and pay. Makes it the browser's
 * cart and redirects into the checkout. Adapted from upstream's dtc-starter.
 *
 * The cookie it sets is SameSite=lax for this route's sake; see setCartId in
 * lib/data/cookies.ts.
 */

// no-referrer keeps the cart's ID, which is all it takes to read the cart,
// out of the Referer sent to anything the checkout page loads.
const NO_STORE = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
}

const gone = (message: string, status = 410) =>
  new NextResponse(message, { status, headers: NO_STORE })

/** The step the cart page's checkout button would open, see cart/templates/summary.tsx. */
const checkoutStep = (cart: HttpTypes.StoreCart) => {
  if (!cart.shipping_address?.address_1 || !cart.email) {
    return "address"
  }
  return cart.shipping_methods?.length ? "payment" : "delivery"
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ countryCode: string; cartId: string }> }
) {
  const { countryCode, cartId } = await params

  // StoreCart does not declare `customer`, though the Store API returns it on
  // request. `*customer` is on the route's allowlist; `customer.has_account`
  // on its own is not, and would be dropped silently.
  const cart = await sdk.client
    .fetch<{
      cart: HttpTypes.StoreCart & {
        customer?: { id: string; has_account?: boolean } | null
      }
    }>(`/store/carts/${cartId}`, {
      query: {
        fields:
          "id,email,completed_at,metadata,shipping_address.address_1,shipping_methods.id,*customer",
      },
      cache: "no-store",
    })
    .then(({ cart }) => cart)
    .catch(() => null)

  if (
    !cart ||
    cart.completed_at ||
    cart.metadata?.[UCP_CANCELED_KEY] === true
  ) {
    return gone("This cart link has expired")
  }

  /*
   * Ownership, since Medusa 2.22.1 (see transferCart in lib/data/customer.ts).
   * The agent creates guest carts, but a link can be built for any cart, so a
   * cart that belongs to a registered account opens only for that account.
   * Otherwise a link to a stranger's cart would put this shopper's address and
   * order into the stranger's account.
   *
   * A guest cart opened by a signed-in shopper is transferred to them, as
   * signing in does with the cart already in the browser, so the order shows
   * up in their account. That only happens when the browser sends the
   * session cookie, which it withholds on the cross-site click from an
   * assistant's chat (the cookie is SameSite=strict); then the shopper
   * continues as a guest, exactly as if signed out.
   */
  const customer = await getCustomer()
  const owner = cart.customer?.has_account ? cart.customer.id : null

  if (owner && owner !== customer?.id) {
    return gone("This cart belongs to another account", 403)
  }

  if (customer && !owner) {
    await sdk.store.cart
      .transferCart(cart.id, {}, await getAuthHeaders())
      // A failed transfer leaves a working guest checkout, which is better
      // than no checkout at all.
      .catch(() => null)
  }

  // After the transfer, so the purge it does covers the cart as transferred.
  await activateCart(cart.id)

  const checkout = `/${countryCode}/checkout?step=${checkoutStep(cart)}`
  return NextResponse.redirect(`${getRequestOrigin(request)}${checkout}`, {
    status: 303,
    headers: NO_STORE,
  })
}
