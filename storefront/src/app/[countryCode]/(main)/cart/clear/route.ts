import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

import { removeCartId } from "@lib/data/cookies"

/**
 * Emergency "clear cart" recovery route. Used when the regular cart page
 * fails to render (e.g. RSC payload error with a large cart) and the
 * customer can't reach the per-line delete buttons.
 *
 * Drops the `_medusa_cart_id` cookie so the next cart fetch creates a
 * fresh empty cart. The original cart row stays in the database (still
 * recoverable by ID if needed), we just stop pointing the browser at it.
 *
 * Usage: redirect the browser to `/{countryCode}/cart/clear?to=/{countryCode}`
 * — the cookie is dropped, the cache tag invalidated, and the customer
 * lands wherever the `to` query param points (defaults to the country
 * homepage).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const { countryCode } = await params
  const url = new URL(request.url)
  const target = url.searchParams.get("to") || `/${countryCode}`

  await removeCartId()
  revalidateTag("cart", "max")

  // Use NextResponse.redirect so the Set-Cookie header from removeCartId
  // is preserved. (next/navigation.redirect throws and bypasses headers.)
  return NextResponse.redirect(new URL(target, request.url))
}
