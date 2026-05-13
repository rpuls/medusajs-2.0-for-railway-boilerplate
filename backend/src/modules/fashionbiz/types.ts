/**
 * Type shapes for the FashionBiz Public API v3.
 * See: docs/Fashionbiz Public APIs.pdf (October 2025)
 *
 * Shapes verified against live responses on 2026-05-13 against
 * `GET /api/v3/products/biz-collection/au/p400ms/`.
 */

export type FashionBizBrandSlug =
  | "biz-collection"
  | "biz-care"
  | "biz-corporates"
  | "syzmik"
  | "good-mates"

export type FashionBizBranch = "au" | "nz" | "ca"

export type FashionBizOptions = {
  token: string
  branch: FashionBizBranch
  base_url: string
  /**
   * Multiplier applied to the API "1-99" wholesale tier price before it
   * feeds into the bulk-price ladder. Default 1.0 = ingest API price as-is.
   * Observed: FashionBiz's distributor storefront charges ~15% above the
   * public-API "1-99" tier, so production should set 1.15 to match.
   */
  cost_adjustment?: number
}

export type FashionBizPrice = {
  /** "1-99" (regular brands) or "Gold" (good-mates), plus "100-499", "500", etc. */
  tier: string
  price: number
}

export type FashionBizImage = {
  id?: number
  image_type?: string
  front?: boolean
  index?: number
  https_attachment_url: string
  https_attachment_url_product?: string
}

export type FashionBizSize = {
  id: number
  sku: string
  size: string
  index?: number
}

export type FashionBizColour = {
  id: number
  name: string
  name_ca_fr?: string | null
  index?: number
  sizes: FashionBizSize[]
  images: FashionBizImage[]
  status?: string
  enable_ship_from_au?: boolean
  enable_ship_from_nz?: boolean
  tag_value?: string | null
  tag_value_alt?: string | null
  hex_value?: string | null
  tag_name?: string | null
  tag_name_alt?: string | null
}

export type FashionBizDescription = {
  sizes?: string
  fabric?: string[]
  features?: string[]
  cares?: string[]
  extras?: string[]
}

/** Shape of an item in the `simple` product list (no description, no colours). */
export type FashionBizProductStub = {
  id: number
  name: string
  slug: string
  brand: string
  original_brand?: string
  code: string
}

/** Full product detail returned by `/products/{brand}/{branch}/{slug}/`. */
export type FashionBizProduct = FashionBizProductStub & {
  index?: number
  description?: FashionBizDescription
  sales_status?: "normal" | "new style" | "new color" | "clearance" | string
  images?: FashionBizImage[]
  colors?: FashionBizColour[]
  tags?: string[]
  sleeve?: string
  fabric?: string
  industry?: string
  tech?: string
  fit?: string
  gender?: string
  suggestions?: unknown[]
  companions?: unknown[]
  stylesheet?: string
  catwalk_url?: string
  size_charts?: unknown[]
  pictograms?: unknown[]
  seo_score?: number | null
  seo_title?: string
  seo_metadesc?: string
  seo_focuskw?: string
  prices?: FashionBizPrice[]
  public_price?: number | null
  subdomain_price?: number | null
  [key: string]: any
}

export type FashionBizSimpleList = {
  count: number
  products: FashionBizProductStub[]
}

export type FashionBizStockEta = {
  eta?: string
  quantity?: number
}

export type FashionBizStockLocation = {
  location?: string
  qtyAvailable?: number
}

export type FashionBizStockItem = {
  sku: string
  formattedItemNo?: string
  size?: string
  eta?: FashionBizStockEta[]
  stock?: FashionBizStockLocation[]
}

export type FashionBizStockResponse = {
  customer_no?: string
  price?: number
  currency?: string
  items?: FashionBizStockItem[]
  color_id?: number
}
