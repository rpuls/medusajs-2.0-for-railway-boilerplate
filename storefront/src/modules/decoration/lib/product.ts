import { HttpTypes } from "@medusajs/types"
import { isPufferJacketProduct } from "@modules/products/lib/variant-options"
import type { DecorationMethod } from "./types"

const ALL_METHODS: DecorationMethod[] = [
  "embroidery",
  "dtf",
  "screen",
  "uvdtf_sheet",
  "uvdtf_applied",
  "uv",
]

const isMethod = (value: unknown): value is DecorationMethod =>
  typeof value === "string" && (ALL_METHODS as string[]).includes(value)

const truthy = (value: unknown): boolean => {
  if (value === true || value === 1) return true
  if (typeof value === "string") return /^(true|1|yes|on)$/i.test(value.trim())
  return false
}

/**
 * Resolve which decoration methods a product opts into.
 *
 * Primary signal: `product.metadata.decoration_methods` — array or comma-separated string of method ids.
 * Backwards compat: `product.metadata.embroidery_enabled` truthy → ["embroidery"].
 */
export const getEnabledDecorationMethods = (
  product: HttpTypes.StoreProduct | null | undefined
): DecorationMethod[] => {
  const metadata = (product?.metadata ?? {}) as Record<string, unknown>
  const raw = metadata.decoration_methods

  let resolved: DecorationMethod[] = []
  if (Array.isArray(raw)) {
    resolved = raw.filter(isMethod)
  } else if (typeof raw === "string" && raw.trim().length > 0) {
    resolved = raw
      .split(",")
      .map((s) => s.trim())
      .filter(isMethod)
  }

  if (resolved.length === 0 && truthy(metadata.embroidery_enabled)) {
    resolved = ["embroidery"]
  }

  if (resolved.length === 0 && isPufferJacketProduct(product)) {
    resolved = ["embroidery"]
  }

  return Array.from(new Set(resolved))
}
