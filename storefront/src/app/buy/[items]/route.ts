import { getAuthHeaders } from "@lib/data/cookies"
import { getRequestOrigin } from "@lib/util/env"
import {
  activateCart,
  createCartWithItems,
  findMissingVariantIds,
  MAX_LINE_ITEM_QUANTITY,
  resolveRegion,
} from "@lib/util/server-cart"
import { NextResponse } from "next/server"

/**
 * UCP cart permalink: /buy/{variant_id}:{quantity},... builds a cart and opens
 * the checkout with it, for an agent that would rather hand over a link than
 * call the API. `?context/address_country=DE` picks the region. Taken from
 * upstream's dtc-starter.
 *
 * A GET that creates a cart, so robots.ts disallows /buy/ for crawlers. It is
 * outside the middleware matcher because it is not region-prefixed.
 */

const ITEM_PATTERN = /^([A-Za-z0-9._-]+|~[A-Za-z0-9_-]+):([1-9][0-9]*)$/
// no-referrer keeps the cart's ID, which is all it takes to read the cart,
// out of the Referer sent to anything the checkout page loads.
const NO_STORE = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
}

const decodeItemId = (token: string) =>
  token.startsWith("~")
    ? Buffer.from(token.slice(1), "base64url").toString("utf8")
    : token

const parseItems = (raw: string) => {
  const items: { variant_id: string; quantity: number }[] = []
  for (const pair of decodeURIComponent(raw).split(",")) {
    const match = pair.match(ITEM_PATTERN)
    if (!match) {
      return null
    }
    const quantity = Number(match[2])
    if (quantity > MAX_LINE_ITEM_QUANTITY) {
      return null
    }
    items.push({ variant_id: decodeItemId(match[1]), quantity })
  }
  return items.length ? items : null
}

const textResponse = (body: string, status: number) =>
  new NextResponse(body, { status, headers: NO_STORE })

export async function GET(
  request: Request,
  { params }: { params: Promise<{ items: string }> }
) {
  const items = parseItems((await params).items)
  if (!items) {
    return textResponse(
      "Malformed permalink. Use /buy/{variant_id}:{quantity},...",
      400
    )
  }

  const country = new URL(request.url).searchParams.get(
    "context/address_country"
  )
  const resolved = await resolveRegion(country ?? undefined)
  if (!resolved) {
    return textResponse(
      "This store does not ship to the requested country",
      400
    )
  }

  const missing = await findMissingVariantIds(
    items.map((item) => item.variant_id)
  )
  if (missing.length) {
    return textResponse(`Unknown items: ${missing.join(", ")}`, 404)
  }

  // Unlike the UCP endpoints this runs in the shopper's own browser, so a
  // signed-in shopper's cart is created as theirs and the order lands in
  // their account.
  let cartId: string
  try {
    cartId = await createCartWithItems(
      resolved.region.id,
      items,
      (await getAuthHeaders()) as Record<string, string>
    )
  } catch {
    return textResponse(
      "One or more items in this link can't be purchased",
      400
    )
  }

  await activateCart(cartId)

  const checkout = `/${resolved.countryCode}/checkout?step=address`
  return NextResponse.redirect(`${getRequestOrigin(request)}${checkout}`, {
    status: 303,
    headers: NO_STORE,
  })
}
