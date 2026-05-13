/**
 * One-shot patch: write `garment_images` metadata to every FashionBiz variant
 * that is missing it. Derives the front/back/all URLs from the parent product's
 * existing image pool using the FashionBiz CDN naming convention:
 *
 *   {code}_Product_{colour}_{01|02}_{hash}.jpg  — flat garment
 *   {code}_Talent_{colour}_{01|02}_{hash}.jpg   — model/lifestyle
 *
 * Run AFTER the initial import if the import left variants without garment_images
 * (this happens when Medusa restores a soft-deleted product and keeps old variant
 * metadata rather than applying the new payload).
 *
 * Usage:
 *   cd /app/.medusa/server && npx medusa exec src/scripts/patch-fashionbiz-garment-images.js
 *
 * Env vars:
 *   DRY_RUN=1  — log what would be updated without writing
 *   FORCE=1    — overwrite garment_images even if already set
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

// ── URL helpers (mirrors mapping.ts) ──────────────────────────────────────────

const urlIsProductFront = (url: string) =>
  url.includes("_Product_") && (url.includes("_01_") || url.includes("_01."))

const urlIsProductBack = (url: string) =>
  url.includes("_Product_") && (url.includes("_02_") || url.includes("_02."))

const urlIsProductFlat = (url: string) => url.includes("_Product_")

function toSlug(s: string): string {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim()
}

/** Returns true if the URL's filename contains the colour label. */
function urlMatchesColor(url: string, colorLabel: string): boolean {
  const normUrl = toSlug(url).replace(/\s/g, "")
  const slug = toSlug(colorLabel)
  if (!slug) return true
  const compact = slug.replace(/\s/g, "")
  if (compact && normUrl.includes(compact)) return true
  const words = slug.split(/\s+/).filter((w) => w.length >= 2)
  if (words.length >= 2) return words.every((w) => normUrl.includes(w))
  if (words.length === 1) return normUrl.includes(words[0])
  return Boolean(compact && normUrl.includes(compact))
}

function buildGarmentImages(
  productUrls: string[],
  colorName: string
): { front: string; back?: string; all: string[] } {
  // Prefer colour-matched images; fall back to full pool if none match.
  let pool = productUrls.filter((u) => urlMatchesColor(u, colorName))
  if (!pool.length) pool = productUrls

  // Flat images first, model after.
  const flat = pool.filter(urlIsProductFlat)
  const model = pool.filter((u) => !urlIsProductFlat(u))
  const sorted = [...flat, ...model]

  const front =
    sorted.find(urlIsProductFront) ??
    sorted.find(urlIsProductFlat) ??
    sorted[0] ??
    ""
  const back = sorted.find(urlIsProductBack)

  return { front, ...(back ? { back } : {}), all: sorted }
}

// ── Script entry point ────────────────────────────────────────────────────────

const PAGE_SIZE = 100

export default async function patchFashionBizGarmentImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT) as unknown as {
    updateProductVariants?: (id: string, data: { metadata?: Record<string, unknown> }) => Promise<unknown>
  }

  if (typeof productModule.updateProductVariants !== "function") {
    throw new Error("Product module updateProductVariants is unavailable")
  }

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const force = process.env.FORCE === "1" || process.env.FORCE === "true"
  logger.info(`patch-fashionbiz-garment-images: dryRun=${dryRun}, force=${force}`)

  let offset = 0
  let totalProducts = 0
  let updated = 0
  let skipped = 0
  let noImages = 0

  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata", "images.url", "variants.id", "variants.metadata"],
      pagination: { take: PAGE_SIZE, skip: offset },
    })

    if (!page?.length) break
    offset += page.length

    for (const product of page) {
      const meta = (product.metadata ?? {}) as Record<string, unknown>
      if (meta.source !== "fashionbiz") continue
      totalProducts++

      const productUrls: string[] = (product.images ?? [])
        .map((i: any) => i.url as string)
        .filter(Boolean)

      if (!productUrls.length) {
        logger.warn(`  ${product.handle}: no product images — skipping all variants`)
        noImages++
        continue
      }

      for (const variant of product.variants ?? []) {
        const vmeta = (variant.metadata ?? {}) as Record<string, any>
        const hasGarmentImages = vmeta.garment_images?.front

        if (hasGarmentImages && !force) {
          skipped++
          continue
        }

        const colorName: string =
          (vmeta.garment_color as string) ||
          (vmeta.fashionbiz?.color_name as string) ||
          ""

        if (!colorName) {
          logger.warn(`  ${product.handle} variant ${variant.id}: no color name — skipping`)
          skipped++
          continue
        }

        const garmentImages = buildGarmentImages(productUrls, colorName)

        if (!garmentImages.front) {
          logger.warn(`  ${product.handle} / ${colorName}: could not resolve front image`)
          skipped++
          continue
        }

        if (dryRun) {
          logger.info(
            `  [dry] ${product.handle} / ${colorName}: front=${garmentImages.front}, back=${garmentImages.back ?? "none"}, all=${garmentImages.all.length} urls`
          )
        } else {
          await productModule.updateProductVariants!(variant.id, {
            metadata: { ...vmeta, garment_images: garmentImages },
          })
        }
        updated++
      }
    }

    if (page.length < PAGE_SIZE) break
  }

  logger.info(
    `Done. Products scanned: ${totalProducts}, variants updated: ${updated}, skipped: ${skipped}, products without images: ${noImages}`
  )
}
