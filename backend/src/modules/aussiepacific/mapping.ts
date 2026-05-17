/**
 * Pure helpers that turn an Aussie Pacific product payload into the shape
 * the Medusa `createProductsWorkflow` accepts. Factored out of the import
 * script so they're easy to unit-test (no DB, no container).
 */

import {
  AussiePacificImage,
  AussiePacificProduct,
  AussiePacificVariant,
} from "./types"

/**
 * Tolerate AP returning collections as either an array or an object keyed
 * by id. Returns a plain array in either case (empty if the value is
 * missing or some other shape).
 */
export const toArray = <T>(value: unknown): T[] => {
  if (!value) return []
  if (Array.isArray(value)) return value as T[]
  if (typeof value === "object") return Object.values(value as Record<string, T>)
  return []
}

export const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export const handleForProduct = (styleCode: string) =>
  `aussie-pacific-${slugify(styleCode)}`

export const titleCase = (s: string | undefined) => {
  if (!s) return ""
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

/**
 * Pull a usable URL out of an image entry. AP's docs don't pin the field
 * name, so we tolerate `url` / `src` / `path` (in that order).
 */
export const imageUrl = (img: AussiePacificImage | undefined): string => {
  if (!img) return ""
  return (img.url ?? img.src ?? img.path ?? "") as string
}

/** Score an image so flat garment shots sort before model/lifestyle. */
const flatnessScore = (img: AussiePacificImage): number => {
  const url = imageUrl(img).toLowerCase()
  if (url.includes("product") || url.includes("flat") || url.includes("ghost")) {
    return 0
  }
  if (url.includes("talent") || url.includes("model") || url.includes("lifestyle")) {
    return 2
  }
  const t = (img.image_type ?? "").toLowerCase()
  if (t.includes("flat") || t.includes("ghost") || t.includes("product")) return 0
  if (t.includes("model") || t.includes("lifestyle") || t.includes("talent")) return 2
  return 1
}

const sortImages = (imgs: AussiePacificImage[]): AussiePacificImage[] =>
  [...imgs].sort((a, b) => {
    const scoreA = flatnessScore(a)
    const scoreB = flatnessScore(b)
    if (scoreA !== scoreB) return scoreA - scoreB
    return (a.index ?? 0) - (b.index ?? 0)
  })

/**
 * Build the `garment_images` metadata block for a single colour variant.
 * Picks a single front URL (preferring flat over model shots), keeps the
 * deduped list of every image associated with the variant.
 */
export const buildGarmentImagesForVariant = (
  variant: AussiePacificVariant
): { front: string; model_image?: string; all: string[] } => {
  const sorted = sortImages(toArray<AussiePacificImage>(variant.images))
  const all = sorted.map(imageUrl).filter(Boolean)

  const front = all.find((u) => !/talent|model|lifestyle/i.test(u)) ?? all[0] ?? ""
  const modelUrl = all.find((u) => /talent|model|lifestyle/i.test(u)) ?? undefined

  return {
    front,
    ...(modelUrl ? { model_image: modelUrl } : {}),
    all,
  }
}

/**
 * Image URLs across the product (top-level + every variant), deduped,
 * flat images first.
 */
export const collectImageUrls = (product: AussiePacificProduct): string[] => {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (img: AussiePacificImage | undefined) => {
    const url = imageUrl(img)
    if (url && !seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }
  for (const top of sortImages(toArray<AussiePacificImage>(product.images))) push(top)
  for (const v of toArray<AussiePacificVariant>(product.variants)) {
    for (const img of sortImages(toArray<AussiePacificImage>(v.images))) push(img)
  }
  return urls
}

/**
 * Coerce AP's `stock_level` field (decimal in the docs) into a non-negative
 * integer that Medusa's inventory module will accept.
 */
export const normalizeStockLevel = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.floor(n)
}
