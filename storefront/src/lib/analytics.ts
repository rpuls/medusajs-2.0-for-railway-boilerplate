/**
 * GA4 Enhanced Ecommerce wrapper.
 *
 * Every public function is a no-op when `NEXT_PUBLIC_GA_MEASUREMENT_ID`
 * isn't set or `gtag` isn't on `window`, so partial deploys (env var
 * missing, ad-blocker active, SSR) never throw.
 *
 * Event names + parameter shapes follow the GA4 Enhanced Ecommerce
 * spec: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export type AnalyticsItem = {
  item_id: string
  item_name: string
  item_brand?: string
  item_category?: string
  item_variant?: string
  price?: number
  quantity?: number
  /** Custom — surfaced as a GA4 user-defined parameter on the event. */
  decoration_method?: string
  garment_supplier?: string
}

const isClient = () => typeof window !== "undefined"

const fire = (name: string, params: Record<string, any>) => {
  if (!isClient()) return
  const gtag = window.gtag
  if (typeof gtag !== "function") return
  try {
    gtag("event", name, params)
  } catch {
    // never throw from analytics
  }
}

/* ---------- catalog events --------------------------------------- */

export const trackViewItem = (item: AnalyticsItem, currency = "AUD") => {
  fire("view_item", {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  })
}

export const trackViewItemList = (
  items: AnalyticsItem[],
  listName: string,
  listId?: string
) => {
  fire("view_item_list", {
    item_list_id: listId ?? listName,
    item_list_name: listName,
    items: items.slice(0, 100),
  })
}

export const trackSelectItem = (
  item: AnalyticsItem,
  listName: string,
  listId?: string
) => {
  fire("select_item", {
    item_list_id: listId ?? listName,
    item_list_name: listName,
    items: [item],
  })
}

/* ---------- cart events ------------------------------------------ */

export const trackAddToCart = (
  items: AnalyticsItem[],
  currency = "AUD"
) => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("add_to_cart", {
    currency,
    value,
    items,
  })
}

export const trackRemoveFromCart = (
  items: AnalyticsItem[],
  currency = "AUD"
) => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("remove_from_cart", {
    currency,
    value,
    items,
  })
}

export const trackViewCart = (items: AnalyticsItem[], currency = "AUD") => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("view_cart", {
    currency,
    value,
    items,
  })
}

/* ---------- checkout events -------------------------------------- */

export const trackBeginCheckout = (
  items: AnalyticsItem[],
  currency = "AUD",
  coupon?: string
) => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("begin_checkout", {
    currency,
    value,
    items,
    coupon,
  })
}

export const trackAddShippingInfo = (
  items: AnalyticsItem[],
  shippingTier: string,
  currency = "AUD"
) => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("add_shipping_info", {
    currency,
    value,
    shipping_tier: shippingTier,
    items,
  })
}

export const trackAddPaymentInfo = (
  items: AnalyticsItem[],
  paymentType: string,
  currency = "AUD"
) => {
  const value = items.reduce(
    (sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 1),
    0
  )
  fire("add_payment_info", {
    currency,
    value,
    payment_type: paymentType,
    items,
  })
}

/* ---------- purchase --------------------------------------------- */

export type PurchaseInput = {
  transaction_id: string
  value: number
  currency: string
  tax?: number
  shipping?: number
  coupon?: string
  items: AnalyticsItem[]
}

/**
 * Fires once per (transaction_id, browser). Stores a localStorage flag
 * so a hard reload of the order-confirmed page doesn't double-count.
 */
export const trackPurchase = (input: PurchaseInput) => {
  if (!isClient()) return
  if (!input.transaction_id) return
  const key = `ga4_purchase_${input.transaction_id}`
  try {
    if (window.localStorage.getItem(key)) return
    window.localStorage.setItem(key, String(Date.now()))
  } catch {
    // localStorage disabled — fall through and fire anyway; better a
    // potential dupe than a lost purchase.
  }
  fire("purchase", {
    transaction_id: input.transaction_id,
    value: input.value,
    currency: input.currency,
    tax: input.tax,
    shipping: input.shipping,
    coupon: input.coupon,
    items: input.items,
  })
}

/* ---------- search ----------------------------------------------- */

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  fire("search", {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

/* ---------- vectorization upsell funnel -------------------------- */

export type VectorizationFunnelStep =
  | "modal_shown"
  | "modal_dismissed"
  | "modal_reupload"
  | "accepted"

/**
 * Customizer low-DPI modal funnel. Fired alongside the equivalent
 * PostHog capture (`phCapture(`vectorization_${step}`, ...)`) so both
 * GA4 funnel reports and PostHog Insights have the same source of truth.
 */
export const trackVectorizationFunnel = (
  step: VectorizationFunnelStep,
  payload: Record<string, any> = {}
) => {
  fire(`vectorization_${step}`, payload)
}

/* ---------- customizer abandonment funnel ------------------------ */

export type CustomizerFunnelStep =
  | "design_started"
  | "design_saved"
  | "design_added_to_cart"

/**
 * Customizer flow steps. The fourth step — design_purchased — is
 * derived server-side from order metadata (lines tagged with
 * customizerDesign / decorationDesign), so no event is fired for it.
 */
export const trackCustomizerFunnel = (
  step: CustomizerFunnelStep,
  payload: Record<string, any> = {}
) => {
  fire(`customizer_${step}`, payload)
}

/* ---------- helpers for converting Medusa shapes ------------------ */

type AnyVariant = {
  id?: string
  title?: string | null
  product?: {
    id?: string
    title?: string | null
    collection?: { title?: string | null } | null
    type?: { value?: string | null } | null
  } | null
  calculated_price?: {
    calculated_amount?: number
    currency_code?: string
  } | null
}

type AnyLineItem = {
  id?: string
  variant_id?: string | null
  product_id?: string | null
  product_title?: string | null
  variant_title?: string | null
  title?: string | null
  unit_price?: number
  quantity?: number
  metadata?: any
}

const decorationMethodFromLineMeta = (meta: any): string | undefined => {
  const m = meta?.decorationDesign?.method
  if (typeof m === "string") return m
  if (meta?.customizerDesign && typeof meta.customizerDesign === "object") {
    return "screen"
  }
  return undefined
}

export const productToItem = (
  variant: AnyVariant,
  quantity = 1
): AnalyticsItem | null => {
  if (!variant?.id) return null
  return {
    item_id: variant.id,
    item_name: variant.product?.title ?? variant.title ?? "Unknown",
    item_brand: variant.product?.collection?.title ?? undefined,
    item_category: variant.product?.type?.value ?? undefined,
    item_variant: variant.title ?? undefined,
    price: variant.calculated_price?.calculated_amount ?? undefined,
    quantity,
  }
}

export const lineItemToItem = (line: AnyLineItem): AnalyticsItem | null => {
  if (!line) return null
  const id = line.variant_id ?? line.product_id ?? line.id ?? ""
  if (!id) return null
  return {
    item_id: id,
    item_name: line.product_title ?? line.title ?? "Unknown",
    item_variant: line.variant_title ?? undefined,
    price: line.unit_price ?? undefined,
    quantity: line.quantity ?? 1,
    decoration_method: decorationMethodFromLineMeta(line.metadata),
    garment_supplier:
      typeof line.metadata?.garment_supplier === "string"
        ? line.metadata.garment_supplier
        : undefined,
  }
}
