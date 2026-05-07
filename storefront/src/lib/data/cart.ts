"use server"

import { MEDUSA_BACKEND_URL, sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import {
  SCP_PRINT_PRICING_VERSION,
  type ScpPrintSizeId,
} from "@modules/customizer/lib/scp-dtf-print-pricing"
import { HttpTypes } from "@medusajs/types"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthHeaders, getCartId, removeCartId, setCartId } from "./cookies"
import { getProductsById } from "./products"
import { getRegion } from "./regions"

const CART_DEBUG_TAG = "[DEBUG-CART-a91f]"
const cartDebug = (message: string, extra?: Record<string, unknown>) => {
  if (extra) {
    console.info(CART_DEBUG_TAG, message, extra)
    return
  }
  console.info(CART_DEBUG_TAG, message)
}

export async function retrieveCart() {
  const cartId = await getCartId()
  cartDebug("retrieveCart:start", { cartId: cartId ?? null })

  if (!cartId) {
    cartDebug("retrieveCart:no-cart-cookie")
    return null
  }

  const retrieveConfig = {
    // `customer_id` is needed so `getOrSetCart` can detect a logged-in
    // customer holding an old guest cart and transfer ownership.
    fields:
      "customer_id,*items.variant.manage_inventory,*items.variant.allow_backorder",
  }
  const authHeaders = await getAuthHeaders()

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, retrieveConfig, {
      next: { tags: ["cart"] },
      ...authHeaders,
    })
    cartDebug("retrieveCart:success", {
      cartId: cart.id,
      itemCount: Array.isArray(cart.items) ? cart.items.length : null,
      authMode: "auth",
    })
    return cart
  } catch (error) {
    cartDebug("retrieveCart:auth-failed", {
      cartId,
      message: error instanceof Error ? error.message : "unknown",
    })
    // Recover from stale/invalid auth cookie by retrying cart retrieval as guest.
    if ("authorization" in authHeaders) {
      try {
        const { cart } = await sdk.store.cart.retrieve(cartId, retrieveConfig, {
          next: { tags: ["cart"] },
        })
        cartDebug("retrieveCart:guest-retry-success", {
          cartId: cart.id,
          itemCount: Array.isArray(cart.items) ? cart.items.length : null,
        })
        return cart
      } catch (retryError) {
        cartDebug("retrieveCart:guest-retry-failed", {
          cartId,
          message: retryError instanceof Error ? retryError.message : "unknown",
        })
        return null
      }
    }
    return null
  }
}

export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)
  cartDebug("getOrSetCart:region", {
    countryCode,
    regionId: region?.id ?? null,
    existingCartId: cart?.id ?? null,
  })

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  // Pre-fetch auth headers ONCE — used for cart create AND cart transfer below.
  // Without these, a logged-in customer's cart was being created as a guest,
  // which meant the resulting order had no `customer_id` and never appeared
  // on /account/orders. (Bug surfaced when admin showed the order but
  // /au/account/orders showed "Nothing to see here".)
  const authHeaders = await getAuthHeaders()
  const isAuthed = "authorization" in authHeaders

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      authHeaders
    )
    cart = cartResp.cart
    await setCartId(cart.id)
    cartDebug("getOrSetCart:created", {
      cartId: cart.id,
      regionId: region.id,
      authMode: isAuthed ? "auth" : "guest",
      customerId: (cart as { customer_id?: string | null }).customer_id ?? null,
    })
    revalidateTag("cart")
  } else if (isAuthed) {
    // Transfer an orphan guest cart (created before login) onto the now-authed
    // customer. Without this, the customer keeps their items but the order
    // they place still has `customer_id = null` and won't show up under
    // /account/orders. Idempotent: Medusa no-ops when the cart already belongs.
    const cartCustomerId =
      (cart as { customer_id?: string | null }).customer_id ?? null
    if (!cartCustomerId) {
      try {
        const { cart: transferred } = await sdk.store.cart.transferCart(
          cart.id,
          {},
          authHeaders
        )
        cart = transferred
        cartDebug("getOrSetCart:transferred", {
          cartId: cart.id,
          newCustomerId:
            (cart as { customer_id?: string | null }).customer_id ?? null,
        })
        revalidateTag("cart")
      } catch (err) {
        // Don't block checkout if transfer fails — log and proceed. The order
        // will still be a guest order; the customer can ask support to merge.
        cartDebug("getOrSetCart:transfer-failed", {
          cartId: cart.id,
          message: err instanceof Error ? err.message : "unknown",
        })
      }
    }
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(
      cart.id,
      { region_id: region.id },
      {},
      authHeaders
    )
    cartDebug("getOrSetCart:region-updated", {
      cartId: cart.id,
      fromRegionId: cart.region_id,
      toRegionId: region.id,
    })
    revalidateTag("cart")
  }

  cartDebug("getOrSetCart:return", { cartId: cart?.id ?? null })
  return cart
}

/**
 * Associates the cookie-stored cart with the just-authenticated customer.
 *
 * Call this from `login` and `signup` immediately after the auth token is
 * persisted. Without it, a customer who built a guest cart, then logged in,
 * then checked out, ends up with an order that has `customer_id = null` and
 * never appears on `/account/orders`. Idempotent: Medusa no-ops when the
 * cart already belongs to the requesting customer.
 *
 * Silent on failure — auth has already succeeded, so we don't want to fail
 * the login UX. The next `getOrSetCart` will retry the transfer anyway.
 */
export async function transferGuestCartToCustomer(
  authHeaders: { authorization: string } | Record<string, string>
): Promise<void> {
  if (!("authorization" in authHeaders)) return
  const cartId = await getCartId()
  if (!cartId) return
  try {
    await sdk.store.cart.transferCart(cartId, {}, authHeaders)
    cartDebug("transferGuestCartToCustomer:success", { cartId })
    revalidateTag("cart")
  } catch (err) {
    cartDebug("transferGuestCartToCustomer:failed", {
      cartId,
      message: err instanceof Error ? err.message : "unknown",
    })
  }
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  return sdk.store.cart
    .update(cartId, data, {}, await getAuthHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
  metadata,
}: {
  variantId: string
  quantity: number
  countryCode: string
  metadata?: Record<string, unknown>
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }
  cartDebug("addToCart:start", {
    cartId: cart.id,
    variantId,
    quantity,
    hasMetadata: !!metadata,
  })

  const payload = {
    variant_id: variantId,
    quantity,
    metadata,
  }
  const authHeaders = await getAuthHeaders()

  try {
    await sdk.store.cart.createLineItem(cart.id, payload, {}, authHeaders)
    cartDebug("addToCart:createLineItem-success", { cartId: cart.id, authMode: "auth" })
  } catch (error) {
    cartDebug("addToCart:createLineItem-auth-failed", {
      cartId: cart.id,
      message: error instanceof Error ? error.message : "unknown",
    })
    if ("authorization" in authHeaders) {
      await sdk.store.cart.createLineItem(cart.id, payload, {}, {}).catch(medusaError)
      cartDebug("addToCart:createLineItem-guest-retry-success", { cartId: cart.id })
    } else {
      medusaError(error)
    }
  }
  revalidateTag("cart")
  cartDebug("addToCart:done", { cartId: cart.id })
}

type AddToCartResult =
  | { ok: true }
  | {
      ok: false
      error: string
    }

/**
 * Use this from client components that should show inline errors instead of
 * triggering the PDP server-component error boundary when add-to-cart fails.
 */
export async function addToCartSafe(input: {
  variantId: string
  quantity: number
  countryCode: string
  metadata?: Record<string, unknown>
}): Promise<AddToCartResult> {
  try {
    await addToCart(input)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Could not add this item to your cart right now.",
    }
  }
}

async function postJsonMedusa(path: string, body: Record<string, unknown>) {
  const envKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim()
  let publishableKey = envKey
  if (!publishableKey) {
    try {
      const keyRes = await fetch(`${MEDUSA_BACKEND_URL}/key-exchange`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (keyRes.ok) {
        const parsed = (await keyRes.json()) as {
          publishableApiKey?: string
          publishable_api_key?: string
        }
        publishableKey =
          parsed.publishableApiKey?.trim() || parsed.publishable_api_key?.trim() || ""
      }
    } catch {
      publishableKey = ""
    }
  }
  if (!publishableKey) {
    throw new Error("Missing publishable key for SCP cart pricing.")
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey,
  }
  Object.assign(headers, await getAuthHeaders())

  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const rawText = await res.text()
  let parsed: Record<string, unknown> | null = null
  try {
    parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null
  } catch {
    parsed = null
  }

  if (!res.ok) {
    const message =
      (parsed?.message as string | undefined) ||
      (parsed?.type as string | undefined) ||
      rawText ||
      `Request failed (${res.status})`
    throw new Error(typeof message === "string" ? message : `Request failed (${res.status})`)
  }

  return parsed
}

/**
 * Server-priced customizable line (garment bulk tier + SCP print matrix). Prefer over `addToCart`
 * for fabric customizer / PDP placements that carry print artifacts.
 */
export async function addScpLineItemToCart(input: {
  variantId: string
  quantity: number
  countryCode: string
  metadata?: Record<string, unknown>
  printSizeId: ScpPrintSizeId
}) {
  const { variantId, quantity, countryCode, metadata, printSizeId } = input

  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart?.id) {
    throw new Error("Error retrieving or creating cart")
  }
  cartDebug("addScpLineItemToCart:start", {
    cartId: cart.id,
    variantId,
    quantity,
    printSizeId,
  })

  try {
    await postJsonMedusa(`/store/carts/${cart.id}/scp-line-items`, {
      variant_id: variantId,
      quantity,
      metadata: metadata ?? {},
      scp_print: {
        version: SCP_PRINT_PRICING_VERSION,
        print_size_id: printSizeId,
      },
    })
    cartDebug("addScpLineItemToCart:scp-route-success", { cartId: cart.id })
  } catch (error) {
    cartDebug("addScpLineItemToCart:scp-route-failed", {
      cartId: cart.id,
      message: error instanceof Error ? error.message : "unknown",
    })
    // Keep checkout usable if the custom SCP endpoint or key config is unavailable.
    const fallbackPayload = {
      variant_id: variantId,
      quantity,
      metadata: {
        ...(metadata ?? {}),
        scp_pricing_fallback: true,
        scp_print: {
          version: SCP_PRINT_PRICING_VERSION,
          print_size_id: printSizeId,
        },
      },
    }
    const authHeaders = await getAuthHeaders()

    try {
      await sdk.store.cart.createLineItem(cart.id, fallbackPayload, {}, authHeaders)
      cartDebug("addScpLineItemToCart:fallback-success", { cartId: cart.id, authMode: "auth" })
    } catch (fallbackError) {
      cartDebug("addScpLineItemToCart:fallback-auth-failed", {
        cartId: cart.id,
        message: fallbackError instanceof Error ? fallbackError.message : "unknown",
      })
      if ("authorization" in authHeaders) {
        await sdk.store.cart.createLineItem(cart.id, fallbackPayload, {}, {}).catch(() => {
          const primaryMessage =
            error instanceof Error ? error.message : "SCP pricing route failed."
          const fallbackMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : "Standard add-to-cart fallback failed."
          throw new Error(`${primaryMessage} ${fallbackMessage}`.trim())
        })
        cartDebug("addScpLineItemToCart:fallback-guest-retry-success", { cartId: cart.id })
      } else {
        const primaryMessage =
          error instanceof Error ? error.message : "SCP pricing route failed."
        const fallbackMessage =
          fallbackError instanceof Error
            ? fallbackError.message
            : "Standard add-to-cart fallback failed."
        throw new Error(`${primaryMessage} ${fallbackMessage}`.trim())
      }
    }
  }

  revalidateTag("cart")
  cartDebug("addScpLineItemToCart:done", { cartId: cart.id })
}

export async function addScpLineItemToCartSafe(input: {
  variantId: string
  quantity: number
  countryCode: string
  metadata?: Record<string, unknown>
  printSizeId: ScpPrintSizeId
}): Promise<AddToCartResult> {
  try {
    await addScpLineItemToCart(input)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Could not add this item to your cart right now.",
    }
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
  revalidateTag("cart")
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // One row per size/design can repeat the same product_id 100+ times. Passing
  // duplicate ids balloons the list API query and can 414/fail checkout RSC.
  const uniqueIds = Array.from(
    new Set(
      lineItems
        .map((lineItem) => lineItem.product_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  )

  let products: Awaited<ReturnType<typeof getProductsById>> | null = null
  try {
    if (uniqueIds.length && regionId) {
      products = await getProductsById({ ids: uniqueIds, regionId })
    }
  } catch {
    products = null
  }

  if (!lineItems.length) {
    return []
  }

  // If the catalog fetch failed, keep checkout alive with unenriched lines
  // rather than returning [] (which would wipe the cart UI).
  if (!products || products.length === 0) {
    return lineItems as HttpTypes.StoreCartLineItem[]
  }

  // Const-bind for the closure: TS doesn't carry `let`-narrowing into the
  // map callback since the binding is technically reassignable from outside.
  const productCatalog = products

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = productCatalog.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    )

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  return sdk.store.cart
    .addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
      revalidateTag("shipping")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
) {
  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, await getAuthHeaders())
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }

  await updateCart({ promo_codes: codes })
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

function trimFormField(entry: FormDataEntryValue | null): string {
  if (typeof entry !== "string") {
    return ""
  }
  return entry.trim()
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: trimFormField(formData.get("shipping_address.address_2")),
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: trimFormField(formData.get("billing_address.address_2")),
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

export async function placeOrder() {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found when placing an order")
  }

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, await getAuthHeaders())
    .then((cartRes) => {
      revalidateTag("cart")
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    await removeCartId()
    redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${countryCode}${currentPath}`)
}

export type SavedCartLineInput = {
  variant_id: string
  quantity: number
  metadata?: Record<string, unknown>
}

export async function replaceCartWithSavedItems({
  countryCode,
  items,
}: {
  countryCode: string
  items: SavedCartLineInput[]
}) {
  if (!countryCode) {
    throw new Error("Missing country code when restoring a saved cart")
  }

  const sanitizedItems = items
    .filter((item) => item?.variant_id && Number(item.quantity) > 0)
    .map((item) => ({
      variant_id: item.variant_id,
      quantity: Math.max(1, Math.floor(item.quantity)),
      metadata: item.metadata ?? {},
    }))

  if (!sanitizedItems.length) {
    throw new Error("No valid items found in saved cart")
  }

  const cart = await getOrSetCart(countryCode)
  const cartId = cart?.id

  if (!cartId) {
    throw new Error("Unable to load cart for saved cart restoration")
  }

  const currentCart = await sdk.store.cart.retrieve(cartId, {}, await getAuthHeaders())
  const currentItems = currentCart.cart.items ?? []

  for (const lineItem of currentItems) {
    await sdk.store.cart
      .deleteLineItem(cartId, lineItem.id, await getAuthHeaders())
      .catch(medusaError)
  }

  for (const item of sanitizedItems) {
    await sdk.store.cart
      .createLineItem(
        cartId,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
          metadata: item.metadata,
        },
        {},
        await getAuthHeaders()
      )
      .catch(medusaError)
  }

  revalidateTag("cart")

  return {
    success: true,
    restored_items: sanitizedItems.length,
  }
}
