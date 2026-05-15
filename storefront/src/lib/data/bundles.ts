import { MEDUSA_BACKEND_URL } from "@lib/config"
import { cache } from "react"

export type BundleItem = {
  id: string
  bundle_id: string
  product_handle: string
  label: string
  quantity_per_unit: number
  decoration_type: "embroidery" | "print" | "none"
  position: number
}

export type Bundle = {
  id: string
  title: string
  handle: string
  subtitle: string | null
  status: "active" | "draft"
  thumbnail_url: string | null
  quantity_multiplier_label: string | null
  items: BundleItem[]
}

export type BundleProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
  metadata: Record<string, unknown> | null
  variants: BundleProductVariant[]
  options?: BundleProductOption[]
}

export type BundleProductVariant = {
  id: string
  title: string
  sku: string | null
  metadata: Record<string, unknown> | null
  /** Inventory tracking — populated by the store/bundles route. */
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
  options?: Array<{
    id: string
    value: string
    option?: { id: string; title: string }
  }>
}

export type BundleProductOption = {
  id: string
  title: string
}

export type BundleWithProducts = Bundle & {
  products: Record<string, BundleProduct>
}

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

function bundleHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (publishableKey) h["x-publishable-api-key"] = publishableKey
  return h
}

export const listBundles = cache(async function (): Promise<Bundle[]> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/bundles`, {
      headers: bundleHeaders(),
      next: { tags: ["bundles"], revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.bundles ?? []
  } catch {
    return []
  }
})

export async function getBundleByHandle(
  handle: string
): Promise<BundleWithProducts | null> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/bundles/${encodeURIComponent(handle)}`,
      {
        headers: bundleHeaders(),
        next: { tags: ["bundles", `bundle-${handle}`], revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.bundle) return null
    return { ...data.bundle, products: data.products ?? {} }
  } catch {
    return null
  }
}
