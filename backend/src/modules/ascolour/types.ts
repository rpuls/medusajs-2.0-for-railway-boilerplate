export type AsColourAddress = {
  company?: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  countryCode: string
  email: string
  phone: string
}

export type AsColourOptions = {
  subscription_key: string
  email: string
  password: string
  base_url: string
  workshop_address: AsColourAddress
  default_shipping_method?: string
}

export type AsColourPaginationParams = {
  pageNumber?: number
  pageSize?: number
  updatedAtMin?: string
}

export type AsColourAuthResponse = {
  token: string
  expiresAt?: string
}

export type AsColourProduct = {
  styleCode: string
  productName?: string
  description?: string
  category?: string
  fabric?: string
  weight?: number | string
  fit?: string
  gender?: string
  countryOfOrigin?: string
  hsCode?: string
  variants?: AsColourVariant[]
  images?: AsColourImage[]
  [key: string]: any
}

export type AsColourVariant = {
  sku: string
  styleCode?: string
  colour?: string
  colourCode?: string
  size?: string
  barcode?: string
  weight?: number | string
  [key: string]: any
}

export type AsColourImage = {
  url: string
  type?: string
  position?: number
  colour?: string
  [key: string]: any
}

export type AsColourInventoryItem = {
  sku: string
  styleCode?: string
  // Real API shape (confirmed via probe-ascolour-inventory.ts): one row per
  // (sku, location) with the qty in `quantity`.
  location?: string
  quantity?: number
  nextDeliveryETA?: string | null
  // Legacy / alternate shapes — kept so parsers can fall back gracefully.
  warehouse?: string
  available?: number
  onHand?: number
  updatedAt?: string
  warehouses?: AsColourWarehouseStock[]
  [key: string]: any
}

export type AsColourWarehouseStock = {
  warehouse: string
  available: number
  onHand?: number
}

export type AsColourPriceListEntry = {
  sku: string
  price: number
  currency?: string
  [key: string]: any
}

export type AsColourShippingMethod = {
  code: string
  name: string
  description?: string
}

export type AsColourCreateOrderItem = {
  sku: string
  warehouse: string
  quantity: number
}

export type AsColourCreateOrderRequest = {
  reference: string
  shippingMethod: string
  orderNotes?: string
  courierInstructions?: string
  shippingAddress: AsColourAddress
  items: AsColourCreateOrderItem[]
}

export type AsColourOrder = {
  id: string
  reference?: string
  status?: string
  createdAt?: string
  shippingMethod?: string
  shippingAddress?: AsColourAddress
  items?: AsColourCreateOrderItem[]
  [key: string]: any
}

export type AsColourShipment = {
  id?: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
  items?: { sku: string; quantity: number }[]
  [key: string]: any
}

export type PaginatedResponse<T> = {
  items?: T[]
  data?: T[]
  results?: T[]
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
} & { [key: string]: any }
