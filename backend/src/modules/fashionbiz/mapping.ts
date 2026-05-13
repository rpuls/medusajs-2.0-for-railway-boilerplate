/**
 * Pure helpers that turn a FashionBiz product payload into the shape the
 * Medusa `createProductsWorkflow` accepts. Factored out of the import
 * script so they're easy to unit-test (no DB, no container).
 */

import {
  FashionBizBrandSlug,
  FashionBizColour,
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

/**
 * Score an image's `image_type` so flat/ghost garment shots sort before
 * model/lifestyle photos. Lower score = higher priority.
 */
const flatnessScore = (img: FashionBizImage): number => {
  const t = (img.image_type ?? "").toLowerCase()
  if (t.includes("flat") || t.includes("ghost") || t.includes("product") || t.includes("technical")) return 0
  if (t.includes("model") || t.includes("lifestyle") || t.includes("catwalk")) return 2
  return 1
}

/** Sort images: `front === true` first, then flat/ghost over model, then API index. */
const sortImages = (imgs: FashionBizImage[]): FashionBizImage[] =>
  [...imgs].sort((a, b) => {
    const frontA = a.front ? 0 : 1
    const frontB = b.front ? 0 : 1
    if (frontA !== frontB) return frontA - frontB
    const scoreA = flatnessScore(a)
    const scoreB = flatnessScore(b)
    if (scoreA !== scoreB) return scoreA - scoreB
    return (a.index ?? 0) - (b.index ?? 0)
  })

const urlLooksLikeFront = (url: string) => {
  const l = url.toLowerCase()
  return l.includes("_front") || l.includes("-front") || l.includes("/front") || l.includes("front.")
}

const urlLooksLikeBack = (url: string) => {
  const l = url.toLowerCase()
  return l.includes("_back") || l.includes("-back") || l.includes("/back") || l.includes("back.")
}

/**
 * Build the `garment_images` metadata block for a single colour variant.
 * Prefers URL-based front/back detection (e.g. filename_front.jpg) over
 * the `front` boolean and `image_type` API fields, which are often absent.
 * Falls back to flat-preference sort order when no URL keyword is found.
 */
export const buildGarmentImagesForColour = (
  colour: FashionBizColour
): { front: string; back?: string; all: string[] } => {
  const sorted = sortImages(colour.images ?? [])
  const all = sorted.map((img) => img.https_attachment_url).filter(Boolean)

  // Prefer a URL explicitly named "front"; if none, take the first non-back image
  const frontUrl =
    all.find(urlLooksLikeFront) ??
    all.find((u) => !urlLooksLikeBack(u)) ??
    all[0] ??
    ""

  const backUrl = all.find(urlLooksLikeBack)

  return {
    front: frontUrl,
    ...(backUrl ? { back: backUrl } : {}),
    all,
  }
}

/** Image URLs across every colour, deduped, flat images first within each colour. */
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
  for (const top of sortImages(product.images ?? [])) push(top)
  const colours = [...(product.colors ?? [])].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  )
  for (const c of colours) {
    for (const img of sortImages(c.images ?? [])) push(img)
  }
  return urls
}
