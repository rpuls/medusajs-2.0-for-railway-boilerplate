import type { AsColourProduct } from "../modules/ascolour/types"
import type { FashionBizProduct } from "../modules/fashionbiz/types"

// Canonical product type names — must match create-product-types.ts exactly.
// All alias keys are lowercase; the values are the exact Medusa ProductType.value strings.
export const PRODUCT_TYPE_ALIASES: Record<string, string> = {
  // T-Shirts
  "tee": "T-Shirts",
  "tees": "T-Shirts",
  "t-shirt": "T-Shirts",
  "t-shirts": "T-Shirts",
  "t shirt": "T-Shirts",
  "t shirts": "T-Shirts",
  "tshirt": "T-Shirts",
  "tshirts": "T-Shirts",
  "basic tee": "T-Shirts",
  "ss tee": "T-Shirts",
  // Polos
  "polo": "Polos",
  "polos": "Polos",
  "polo shirt": "Polos",
  "polo shirts": "Polos",
  // Hoodies
  "hoodie": "Hoodies",
  "hoodies": "Hoodies",
  "pullover hoodie": "Hoodies",
  "zip hoodie": "Hoodies",
  "zip up hoodie": "Hoodies",
  "zip-up hoodie": "Hoodies",
  // Sweatshirts / Crews
  "sweatshirt": "Sweatshirts",
  "sweatshirts": "Sweatshirts",
  "crew": "Sweatshirts",
  "crew neck": "Sweatshirts",
  "crewneck": "Sweatshirts",
  // Shirts (woven / work / dress)
  "shirt": "Shirts",
  "shirts": "Shirts",
  "work shirt": "Shirts",
  "business shirt": "Shirts",
  "short sleeve shirt": "Shirts",
  "ss shirt": "Shirts",
  "shirting and tops": "Shirts",
  // Healthcare scrub tops typically classify as Shirts; hi-vis is NOT a
  // garment type (it's a feature — see TAG_ALIASES) so it doesn't go here.
  "scrubs": "Shirts",
  // Longsleeves
  "longsleeve": "Longsleeves",
  "longsleeves": "Longsleeves",
  "long sleeve": "Longsleeves",
  "long-sleeve": "Longsleeves",
  "long sleeve shirt": "Longsleeves",
  "ls shirt": "Longsleeves",
  "ls tee": "Longsleeves",
  // Singlets / Tanks
  "singlet": "Singlets / Tanks",
  "singlets": "Singlets / Tanks",
  "tank": "Singlets / Tanks",
  "tanks": "Singlets / Tanks",
  "tank top": "Singlets / Tanks",
  "sleeveless": "Singlets / Tanks",
  // Shorts
  "shorts": "Shorts",
  "short": "Shorts",
  "board short": "Shorts",
  "board shorts": "Shorts",
  "boardshort": "Shorts",
  "boardshorts": "Shorts",
  // Pants
  "pants": "Pants",
  "pant": "Pants",
  "trouser": "Pants",
  "trousers": "Pants",
  "cargo pant": "Pants",
  "cargo pants": "Pants",
  "chino": "Pants",
  "chinos": "Pants",
  // Jackets
  "jacket": "Jackets",
  "jackets": "Jackets",
  "fleece": "Jackets",
  "softshell": "Jackets",
  "soft shell": "Jackets",
  "windbreaker": "Jackets",
  "rain jacket": "Jackets",
  "vest": "Jackets",
  "vests": "Jackets",
  // Headwear
  "cap": "Headwear",
  "caps": "Headwear",
  "hat": "Headwear",
  "hats": "Headwear",
  "beanie": "Headwear",
  "beanies": "Headwear",
  "headwear": "Headwear",
  "bucket hat": "Headwear",
  "trucker": "Headwear",
  "trucker cap": "Headwear",
  "snapback": "Headwear",
  "visor": "Headwear",
  // Bags
  "bag": "Bags",
  "bags": "Bags",
  "tote": "Bags",
  "tote bag": "Bags",
  "backpack": "Bags",
  "backpacks": "Bags",
  "drawstring bag": "Bags",
  "cooler bag": "Bags",
  // Accessories
  "accessory": "Accessories",
  "accessories": "Accessories",
  "lanyard": "Accessories",
  "lanyards": "Accessories",
  "belt": "Accessories",
  "belts": "Accessories",
  "umbrella": "Accessories",
  "towel": "Accessories",
  // Socks
  "socks": "Socks",
  "sock": "Socks",
  // Aprons
  "apron": "Aprons",
  "aprons": "Aprons",
  // Overalls
  "overalls": "Overalls",
  "overall": "Overalls",
  "coverall": "Overalls",
  "coveralls": "Overalls",
  // Trackpants
  "trackpants": "Trackpants",
  "track pants": "Trackpants",
  "tracksuit pants": "Trackpants",
  "jogger": "Trackpants",
  "joggers": "Trackpants",
  // Underwear / Kids
  "underwear": "Underwear",
  "kids": "Kids",
  "youth": "Kids",
  "children": "Kids",
}

// Canonical tag names. Lowercase keys → canonical Medusa ProductTag.value strings.
export const TAG_ALIASES: Record<string, string> = {
  // Gender
  "men": "Men",
  "mens": "Men",
  "men's": "Men",
  "male": "Men",
  "women": "Women",
  "womens": "Women",
  "women's": "Women",
  "ladies": "Women",
  "female": "Women",
  "unisex": "Unisex",
  "uni-sex": "Unisex",
  "kids | youth": "Kids",
  "kids": "Kids",
  "youth": "Kids",
  // Fit
  "regular": "Regular Fit",
  "regular fit": "Regular Fit",
  "slim": "Slim Fit",
  "slim fit": "Slim Fit",
  "slim-regular": "Slim Fit",
  "relaxed": "Relaxed Fit",
  "relaxed fit": "Relaxed Fit",
  "loose": "Relaxed Fit",
  "oversized": "Oversized",
  "modern fit": "Modern Fit",
  "classic fit": "Classic Fit",
  "tailored fit": "Tailored Fit",
  "easy fit": "Easy Fit",
  "semi-fitted": "Semi-Fitted",
  "semi fitted": "Semi-Fitted",
  // Sleeve length
  "short sleeve": "Short Sleeve",
  "short-sleeve": "Short Sleeve",
  "shortsleeve": "Short Sleeve",
  "short": "Short Sleeve",
  "ss": "Short Sleeve",
  "long sleeve": "Long Sleeve",
  "long-sleeve": "Long Sleeve",
  "longsleeve": "Long Sleeve",
  "long": "Long Sleeve",
  "ls": "Long Sleeve",
  "sleeveless": "Sleeveless",
  "3/4 sleeve": "3/4 Sleeve",
  "3/4 sleeves": "3/4 Sleeve",
  // Cap profile (headwear)
  "high profile": "High Profile",
  "mid profile": "Mid Profile",
  "low profile": "Low Profile",
  // Industry
  "corporate": "Corporate",
  "business": "Corporate",
  "healthcare": "Healthcare",
  "medical": "Healthcare",
  "hospitality": "Hospitality",
  "construction": "Construction",
  "industrial": "Industrial",
  // Safety
  "hi-vis": "Hi-Vis",
  "hi vis": "Hi-Vis",
  "high vis": "Hi-Vis",
  "high-vis": "Hi-Vis",
  "high visibility": "Hi-Vis",
  "hivis": "Hi-Vis",
  "hi vis taped": "Hi-Vis",
  // Tech / fabric properties
  "stretch": "Stretch",
  "4-way stretch": "Stretch",
  "moisture-wicking": "Moisture-Wicking",
  "moisture wicking": "Moisture-Wicking",
  "quick-dry": "Quick-Dry",
  "quick dry": "Quick-Dry",
  "uv protection": "UV Protection",
  "uv": "UV Protection",
  "upf": "UV Protection",
  "uv50+": "UV Protection",
  "upf50+": "UV Protection",
  "recycled": "Recycled",
  "sustainable": "Recycled",
  "organic": "Organic",
  "anti-static": "Anti-Static",
  "antistatic": "Anti-Static",
  "waterproof": "Waterproof",
  "water resistant": "Waterproof",
  "water-resistant": "Waterproof",
  "reflective": "Reflective",
  "breathable": "Breathable",
  "antibacterial": "Antibacterial",
}

// Tag values that are placeholders / garbage data — silently dropped.
const GARBAGE_TAG_VALUES = new Set<string>([
  "to be filled in",
  "n/a",
  "na",
  "tbd",
  "tbc",
  "undefined",
  "null",
  "none",
  "-",
])

/**
 * Set of lowercase tag values that should be treated as garment-type indicators
 * (i.e. inputs to product_type derivation). When `normalizeTags` sees one of
 * these, it skips it — those values belong in product_type, not in tags.
 *
 * Built lazily from PRODUCT_TYPE_ALIASES keys so the two stay in sync.
 */
let GARMENT_TYPE_RAW_KEYS_CACHE: Set<string> | null = null
function getGarmentTypeRawKeys(): Set<string> {
  if (!GARMENT_TYPE_RAW_KEYS_CACHE) {
    GARMENT_TYPE_RAW_KEYS_CACHE = new Set(Object.keys(PRODUCT_TYPE_ALIASES))
  }
  return GARMENT_TYPE_RAW_KEYS_CACHE
}

function internalTitleCase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

/**
 * Map a raw supplier string to a canonical product type name.
 * Falls back to title-cased trimmed value for unknowns, and pushes a log
 * message to unknownLog so the alias map can be extended.
 * Returns null for empty/null input.
 */
export function normalizeProductType(
  raw: string | null | undefined,
  unknownLog?: string[]
): string | null {
  if (!raw?.trim()) return null
  const trimmed = raw.trim()
  const key = trimmed.toLowerCase()
  const canonical = PRODUCT_TYPE_ALIASES[key]
  if (canonical) return canonical
  const fallback = internalTitleCase(trimmed)
  unknownLog?.push(
    `[product_type] Unknown raw value "${trimmed}" → fell back to "${fallback}"`
  )
  return fallback
}

/**
 * Map an array of raw supplier strings to deduplicated canonical tag names.
 *
 * Silently dropped:
 *   - null/empty values
 *   - garbage placeholders (e.g. "TO BE FILLED IN", "N/A")
 *   - garment-type indicators (anything in PRODUCT_TYPE_ALIASES) — these
 *     belong in product_type, not as tags
 *
 * Unknown values fall back to title-case and are logged so the alias map
 * can be extended.
 */
export function normalizeTags(
  raws: (string | null | undefined)[],
  unknownLog?: string[]
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const garmentTypeKeys = getGarmentTypeRawKeys()
  for (const raw of raws) {
    if (!raw?.trim()) continue
    const trimmed = raw.trim()
    const key = trimmed.toLowerCase()
    if (GARBAGE_TAG_VALUES.has(key)) continue
    if (garmentTypeKeys.has(key)) continue
    let canonical = TAG_ALIASES[key]
    if (!canonical) {
      canonical = internalTitleCase(trimmed)
      unknownLog?.push(
        `[tag] Unknown raw value "${trimmed}" → fell back to "${canonical}"`
      )
    }
    if (!seen.has(canonical)) {
      seen.add(canonical)
      out.push(canonical)
    }
  }
  return out
}

/**
 * Derive Medusa product_type and tags from an AS Colour product.
 *   product_type ← product.productType (real API field) or product.category (legacy)
 *   tags         ← product.gender + product.fit
 */
export function classifyAsColourProduct(
  product: AsColourProduct,
  unknownLog?: string[]
): { productType: string | null; tags: string[] } {
  // The real AS Colour API returns the garment category in a `productType`
  // field (per the comments in import-as-colour-from-api.ts). Older snapshots
  // may use `category` — try both.
  const rawType = (product as any).productType ?? product.category
  const productType = normalizeProductType(rawType, unknownLog)
  const rawTags = [
    (product as any).gender as string | undefined,
    (product as any).fit as string | undefined,
  ]
  const tags = normalizeTags(rawTags, unknownLog)
  return { productType, tags }
}

/**
 * Derive Medusa product_type and tags from a FashionBiz product.
 *
 * product_type: scan product.tags[] for the first entry that resolves to a
 *   garment-type alias. For each tag, try exact match first, then split on
 *   whitespace/hyphens/underscores and check each token (so "syzmik-shirts"
 *   resolves via "shirts", "clearance tees" via "tees"). If no tag resolves,
 *   product_type is left null — better to leave it unset than guess wrong.
 *
 * tags: all of product.tags + gender + fit + sleeve + industry + tech,
 *   normalised through TAG_ALIASES and deduplicated. Garment-type indicators
 *   are excluded automatically (they're the product_type, not a tag).
 */
export function classifyFashionBizProduct(
  product: Pick<
    FashionBizProduct,
    "slug" | "tags" | "gender" | "fit" | "sleeve" | "industry" | "tech"
  >,
  unknownLog?: string[]
): { productType: string | null; tags: string[] } {
  const rawTags = product.tags ?? []

  let productType: string | null = null
  outer: for (const t of rawTags) {
    if (!t?.trim()) continue
    const key = t.trim().toLowerCase()
    if (key in PRODUCT_TYPE_ALIASES) {
      productType = PRODUCT_TYPE_ALIASES[key]
      break
    }
    // Token-based fallback: handles "syzmik-shirts", "clearance tees",
    // "shirts and polos", "work-shirts-and-polos", etc.
    for (const token of key.split(/[\s\-_]+/)) {
      if (token && token in PRODUCT_TYPE_ALIASES) {
        productType = PRODUCT_TYPE_ALIASES[token]
        break outer
      }
    }
  }

  if (!productType && rawTags.length > 0) {
    unknownLog?.push(
      `[fashionbiz product_type] No garment-type tag found in tags=[${rawTags.join(", ")}] for slug="${product.slug ?? "unknown"}" — leaving product_type unset.`
    )
  }

  const allRawTags: (string | null | undefined)[] = [
    ...rawTags,
    product.gender,
    product.fit,
    product.sleeve,
    product.industry,
    product.tech,
  ]
  const tags = normalizeTags(allRawTags, unknownLog)

  return { productType, tags }
}
