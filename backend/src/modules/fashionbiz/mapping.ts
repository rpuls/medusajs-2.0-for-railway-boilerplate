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
 * Score an image so flat/ghost garment shots sort before model/lifestyle.
 * FashionBiz URL convention: _Product_ = flat garment, _Talent_ = model.
 * Falls back to image_type field if URL gives no signal.
 * Lower score = higher priority.
 */
const flatnessScore = (img: FashionBizImage): number => {
  const url = img.https_attachment_url ?? ""
  if (url.includes("_Product_")) return 0
  if (url.includes("_Talent_")) return 2
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

/**
 * FashionBiz URL pattern: _Product_{colour}_01 = flat front,
 * _Product_{colour}_02 = flat back, _Talent_ = model/lifestyle.
 * The index suffix (_01, _02) may be followed by a hash or the extension.
 */
const urlIsProductFront = (url: string) =>
  url.includes("_Product_") && (url.includes("_01_") || url.includes("_01."))

const urlIsProductBack = (url: string) =>
  url.includes("_Product_") && (url.includes("_02_") || url.includes("_02."))

const urlIsProductFlat = (url: string) => url.includes("_Product_")

/**
 * Build the `garment_images` metadata block for a single colour variant.
 * Uses FashionBiz's _Product_/_Talent_ URL convention to identify flat
 * garment shots vs model photos, and _01/_02 suffix for front vs back.
 */
export const buildGarmentImagesForColour = (
  colour: FashionBizColour
): { front: string; back?: string; model_image?: string; all: string[] } => {
  const sorted = sortImages(colour.images ?? [])
  const all = sorted.map((img) => img.https_attachment_url).filter(Boolean)

  const frontUrl =
    all.find(urlIsProductFront) ??  // e.g. P515MS_Product_Black_01_xxx.jpg
    all.find(urlIsProductFlat) ??   // any flat _Product_ image as fallback
    ""                              // don't fall back to model/lifestyle photos

  const backUrl =
    all.find(urlIsProductBack) ??   // e.g. P515MS_Product_Black_02_xxx.jpg
    undefined

  const modelUrl = all.find((u) => u.includes("_Talent_")) ?? undefined

  return {
    front: frontUrl,
    ...(backUrl ? { back: backUrl } : {}),
    ...(modelUrl ? { model_image: modelUrl } : {}),
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
