/**
 * Type shapes for the Aussie Pacific API v1.
 * See: https://api.aussiepacific.com.au/docs/
 *
 * Some fields are intentionally permissive (`[key: string]: any`) — Aussie
 * Pacific's docs don't fully document response shapes, so we keep the types
 * tolerant and only narrow what we observe in practice.
 */

export type AussiePacificOptions = {
  token: string
  base_url: string
  /**
   * Multiplier applied to the API `price` field before it feeds into the
   * retail price ladder. Default 1.0 = ingest the API price as-is.
   *
   * Calibrate after seeing the first real invoice: if AP's API price is
   * ex-GST cost (the assumed case, matching AS Colour + FashionBiz "1-99"),
   * keep it at 1.0. If it turns out to be inc-GST, set 0.909
   * (≈ 1 / 1.1). If it sits above trade like FashionBiz's distributor
   * storefront, set the observed ratio.
   */
  cost_adjustment?: number
  /**
   * Optional default shipping method to embed in dropship order payloads.
   * Falls back to the value the admin operator enters in the widget.
   */
  default_shipping_method?: string
}

export type AussiePacificImage = {
  /** Vendor-hosted URL. Field name varies by payload — we tolerate `url`, `src`, `path`. */
  url?: string
  src?: string
  path?: string
  /** Optional sort order from the API. */
  index?: number
  /** Optional image category — model, flat, etc. */
  image_type?: string
  [key: string]: any
}

export type AussiePacificVariant = {
  sku: string
  barcode?: string
  /** Single wholesale price, AUD. Assumed ex-GST (see cost_adjustment docs above). */
  price?: number
  colour?: string
  size?: string
  /** Decimal — AP returns this as a number; treat values < 0 as 0. */
  stock_level?: number
  images?: AussiePacificImage[]
  [key: string]: any
}

export type AussiePacificProduct = {
  name: string
  main_category?: string
  sub_category?: string
  brand?: string
  style_code: string
  style?: string
  run_out?: boolean
  description?: string
  variants?: AussiePacificVariant[]
  images?: AussiePacificImage[]
  [key: string]: any
}

export type AussiePacificListResponse = {
  /** Aussie Pacific docs are vague about the wrapper shape — tolerate
   *  either `{ data: [...] }`, `{ products: [...] }`, or a bare array. */
  data?: AussiePacificProduct[]
  products?: AussiePacificProduct[]
  page?: number
  limit?: number
  total?: number
  [key: string]: any
}

/** Payload accepted by `POST /api/v1/order`. */
export type AussiePacificCreateOrderRequest = {
  /** Purchase Order number (we use Medusa `order.display_id`). */
  po_number: string
  /** Contact at SC Prints for AP to reach. */
  contact: {
    name: string
    phone: string
    email?: string
  }
  /** Ship-to address — SC Prints workshop. */
  address: {
    company: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  /** Lines: SKU + qty. */
  lines: Array<{
    item_code: string
    quantity: number
  }>
  shipping_method?: string
  /** ≤1000 chars per AP docs. */
  delivery_notes?: string
}

/** Best-effort shape of the `POST /api/v1/order` response — AP docs don't
 *  pin this down, so we tolerate either an object or a bare string ID. */
export type AussiePacificOrder = {
  id?: string
  reference?: string
  status?: string
  [key: string]: any
}
