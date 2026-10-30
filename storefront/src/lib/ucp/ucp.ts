import { isVariantInStock } from "@lib/util/inventory"
import { HttpTypes } from "@medusajs/types"

/**
 * Universal Commerce Protocol (https://ucp.dev): a shopper's AI agent finds
 * products here, builds a cart and starts a checkout, then hands the shopper a
 * link to pay on this site. Ported from upstream's dtc-starter (PR #88, at
 * 6965d8ac); the differences are noted where they are made.
 *
 * Everything goes through the Store API with the publishable key, without a
 * shopper's session, so an agent can see and do exactly what an anonymous
 * visitor can and nothing more. That is why the endpoints need no auth.
 */

export const UCP_VERSION = "2026-08-25"
export const UCP_REST_BASE_PATH = "/ucp/v1"
export const UCP_MCP_PATH = "/ucp/mcp"

/** Cart metadata key that marks a cart or checkout the agent canceled. */
export const UCP_CANCELED_KEY = "ucp_canceled"

const capability = (path: string, schema: string) => ({
  spec: `https://ucp.dev/${UCP_VERSION}/specification/shopping/${path}`,
  schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/${schema}.json`,
})

export const UCP_CAPABILITIES = {
  "dev.ucp.shopping.catalog.search": capability("catalog/search", "catalog_search"),
  "dev.ucp.shopping.catalog.lookup": capability("catalog/lookup", "catalog_lookup"),
  "dev.ucp.shopping.cart": capability("cart", "cart"),
  "dev.ucp.shopping.checkout": capability("checkout", "checkout"),
} as const

export type CapabilityName = keyof typeof UCP_CAPABILITIES

export type UcpResult = { status: number; body: Record<string, unknown> }

/**
 * Every field here is on the Store API's allowlist for its route. Since Medusa
 * 2.21 a field outside it is dropped silently with a 200, and a missing
 * `variants.inventory_quantity` would make every variant read as sold out.
 */
export const UCP_PRODUCT_FIELDS =
  "id,title,handle,description,thumbnail,*images,*options,*variants,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.calculated_price,*variants.options"

// Fields without a + replace Medusa's defaults, so this is the whole cart.
// `billing_address.id` and `shipping_methods.id` are additions to upstream's
// list: the first decides whether the agent's address may fill in billing,
// the second whether a delivery choice has been made yet.
export const UCP_CART_FIELDS =
  "id,email,currency_code,region_id,completed_at,metadata,*items,+items.subtotal,+items.total,item_subtotal,discount_total,shipping_total,tax_total,total,*region.countries,*shipping_address,billing_address.id,shipping_methods.id"

const minorUnitDigits = (currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
    .maximumFractionDigits ?? 2

/** Converts a Medusa amount (major units) to UCP minor units. */
export const toMinorUnits = (amount: number | null | undefined, currencyCode: string) =>
  Math.round((amount ?? 0) * 10 ** minorUnitDigits(currencyCode.toUpperCase()))

const toMoney = (amount: number | null | undefined, currencyCode: string) => ({
  amount: toMinorUnits(amount, currencyCode),
  currency: currencyCode.toUpperCase(),
})

export const ucpResult = (
  name: CapabilityName,
  body: Record<string, unknown>,
  status = 200
): UcpResult => ({
  status,
  body: {
    ucp: {
      version: UCP_VERSION,
      status: status < 400 ? "success" : "error",
      capabilities: { [name]: [{ version: UCP_VERSION }] },
      ...(name === "dev.ucp.shopping.checkout" ? { payment_handlers: {} } : {}),
    },
    ...body,
  },
})

export const ucpError = (
  name: CapabilityName,
  status: number,
  code: string,
  content: string
): UcpResult =>
  ucpResult(
    name,
    {
      messages: [
        {
          type: "error",
          code,
          content,
          severity: status >= 500 ? "recoverable" : "unrecoverable",
        },
      ],
    },
    status
  )

export const toResponse = ({ status, body }: UcpResult) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

export const readJsonBody = async (
  request: Request
): Promise<Record<string, unknown> | null> => {
  try {
    const body = await request.json()
    return body && typeof body === "object" && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

export const toUcpProduct = (
  product: HttpTypes.StoreProduct,
  currencyCode: string,
  productUrl: string
) => {
  const optionTitles = new Map(
    (product.options ?? []).map((option) => [option.id, option.title])
  )
  const variants = (product.variants ?? []).filter(
    (variant) => variant.calculated_price?.calculated_amount != null
  )
  const amounts = variants.map((v) => v.calculated_price!.calculated_amount!)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? "",
    url: productUrl,
    media: (product.images ?? []).map((image) => ({
      type: "image",
      url: image.url,
      alt_text: product.title,
    })),
    price_range: amounts.length
      ? {
          min: toMoney(Math.min(...amounts), currencyCode),
          max: toMoney(Math.max(...amounts), currencyCode),
        }
      : undefined,
    variants: variants.map((variant) => {
      const available = isVariantInStock(variant)
      return {
        id: variant.id,
        sku: variant.sku ?? undefined,
        title: variant.title ?? product.title,
        // Upstream appends ?v_id=, which this storefront's product page does
        // not read. See product-structured-data.ts.
        url: productUrl,
        price: toMoney(variant.calculated_price!.calculated_amount, currencyCode),
        availability: { available, status: available ? "in_stock" : "out_of_stock" },
        options: (variant.options ?? []).map((value) => ({
          name: optionTitles.get(value.option_id ?? "") ?? "",
          value: value.value,
        })),
      }
    }),
  }
}

export const toUcpLineItems = (cart: HttpTypes.StoreCart) =>
  (cart.items ?? []).map((item) => ({
    id: item.id,
    item: {
      id: item.variant_id,
      title: [item.product_title, item.variant_title].filter(Boolean).join(" - "),
      price: toMinorUnits(item.unit_price, cart.currency_code),
    },
    quantity: item.quantity,
    totals: [
      { type: "subtotal", amount: toMinorUnits(item.subtotal, cart.currency_code) },
      { type: "total", amount: toMinorUnits(item.total, cart.currency_code) },
    ],
  }))

/**
 * The fulfillment line is left out until the shopper has chosen a delivery
 * option. Upstream always sends it, which reports shipping as 0 before
 * anything is chosen, and an assistant reads that as free shipping.
 */
export const toUcpTotals = (cart: HttpTypes.StoreCart) => [
  { type: "subtotal", amount: toMinorUnits(cart.item_subtotal, cart.currency_code) },
  { type: "discount", amount: toMinorUnits(cart.discount_total, cart.currency_code) },
  ...(cart.shipping_methods?.length
    ? [{ type: "fulfillment", amount: toMinorUnits(cart.shipping_total, cart.currency_code) }]
    : []),
  { type: "tax", amount: toMinorUnits(cart.tax_total, cart.currency_code) },
  { type: "total", amount: toMinorUnits(cart.total, cart.currency_code) },
]

const MAX_LINE_ITEMS = 50
const MAX_QUANTITY = 100

/** Validates a UCP `line_items` array into Medusa variant/quantity pairs. */
export const parseLineItems = (
  value: unknown
): { variant_id: string; quantity: number }[] | null => {
  if (!Array.isArray(value) || value.length > MAX_LINE_ITEMS) {
    return null
  }

  const items: { variant_id: string; quantity: number }[] = []
  for (const entry of value) {
    const id = entry?.item?.id
    const quantity = entry?.quantity
    if (
      typeof id !== "string" ||
      !id ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      return null
    }
    items.push({ variant_id: id, quantity })
  }
  return items
}

/**
 * The country a cart's links are prefixed with: its shipping address, or for
 * a cart without one, the store's default country when the cart's region
 * covers it. Upstream takes the region's first country, which for the seeded
 * Europe region is dk while the store's default is gb.
 */
export const cartCountryCode = (cart: HttpTypes.StoreCart) => {
  const countries = (cart.region?.countries ?? [])
    .map((country) => country.iso_2?.toLowerCase())
    .filter((code): code is string => Boolean(code))
  const preferred = process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase()

  return (
    cart.shipping_address?.country_code ??
    (preferred && countries.includes(preferred) ? preferred : countries[0]) ??
    ""
  ).toLowerCase()
}

/** The link the shopper opens to pay. See src/app/[countryCode]/(main)/cart/resume. */
export const cartContinueUrl = (origin: string, cart: HttpTypes.StoreCart) =>
  `${origin}/${cartCountryCode(cart)}/cart/resume/${cart.id}`
