/**
 * Shared types for the POS admin UI. Mirrors the backend POSLineItem
 * shape (see `backend/src/modules/pos-session/models/pos-session.ts`).
 */

export type POSLineItem = {
  id: string
  kind: "standard" | "customizer"
  variant_id: string | null
  product_id: string
  product_title: string
  variant_title: string | null
  quantity: number
  unit_price_cents: number | null
  metadata: Record<string, unknown>
  added_at: string
}

export type POSSession = {
  id: string
  created_by_user_id: string
  customer_id: string | null
  items: POSLineItem[]
  status: "active" | "completed" | "cancelled" | "expired"
  completed_order_id: string | null
  expires_at: string
  created_at: string
  updated_at: string
}

export type POSCustomer = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
}

export type POSRegion = {
  id: string
  name: string
  currency_code: string
}

export type POSSalesChannel = {
  id: string
  name: string
}

export type POSProductVariant = {
  id: string
  title: string
  sku: string | null
  inventory_quantity?: number
  calculated_price?: { calculated_amount: number; currency_code: string } | null
}

export type POSProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants: POSProductVariant[]
}

export type POSCheckoutResult = {
  order: {
    id: string
    display_id: number | string | null
    total: number
    currency_code: string
    email: string | null
  }
  payment: {
    method: "cash" | "stripe_link"
    status: "paid" | "awaiting"
    payment_link_url?: string | null
    payment_link_id?: string | null
  }
}

export type POSDiscount = {
  promo_codes: string[]
  /** Manual whole-of-sale discount in cents. Distinct from
   *  variant-level price overrides on individual lines. */
  manual_discount_cents: number
}
