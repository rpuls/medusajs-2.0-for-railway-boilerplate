/**
 * Pure helpers that turn a FashionBiz product payload into the shape the
 * Medusa `createProductsWorkflow` accepts. Factored out of the import
 * script so they're easy to unit-test (no DB, no container).
 */

import {
  FashionBizBrandSlug,
  FashionBizDescription,
  FashionBizImage,
  FashionBizProduct,
} from "./types"

export const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export const handleForProduct = (brand: FashionBizBrandSlug, slug: string) =>
  `${brand}-${slugify(slug)}`

export const titleCase = (s: string | undefined) => {
  if (!s) return ""
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

/**
 * Coerce a FashionBiz description section into a string array. The API is
 * inconsistent: `fabric` (and occasionally other sections) is returned as
 * `string[]` for some products and as a single `string` for others
 * (observed live 2026-05-13 on biz-collection/bp2616ms vs bp2616ls).
 * Non-strings are dropped to defend against future shape drift.
 */
const toStringArray = (value: unknown): string[] => {
  if (!value) return []
  if (typeof value === "string") return value.trim() ? [value] : []
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0)
  return []
}

/**
 * Render the FashionBiz `description` object into a single readable block
 * suitable for `product.description`. Sections are emitted only if they
 * have content. Tolerates string-or-array shapes per section (see
 * `toStringArray` above).
 */
export const renderDescription = (description: FashionBizDescription | undefined): string => {
  if (!description) return ""
  const parts: string[] = []
  if (description.sizes) parts.push(`Sizes: ${description.sizes}`)
  const sections: Array<[string, unknown]> = [
    ["Fabric", description.fabric],
    ["Features", description.features],
    ["Care", description.cares],
    ["Extras", description.extras],
  ]
  for (const [label, raw] of sections) {
    const items = toStringArray(raw)
    if (items.length) {
      parts.push(`${label}:\n${items.map((i) => `- ${i}`).join("\n")}`)
    }
  }
  return parts.join("\n\n")
}

/** Image URLs across every colour, deduped, ordered by colour index then image index. */
export const collectImageUrls = (product: FashionBizProduct): string[] => {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (img: FashionBizImage | undefined) => {
    const url = img?.https_attachment_url
    if (url && !seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }
  for (const top of product.images ?? []) push(top)
  const colours = [...(product.colors ?? [])].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  )
  for (const c of colours) {
    const imgs = [...(c.images ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    for (const img of imgs) push(img)
  }
  return urls
}
