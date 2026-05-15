/**
 * One-shot upgrade: walk every product imported from AS Colour and replace
 * its image URLs with the higher-resolution `urlZoom` variant from the AS
 * Colour API. The original importer (before 2026-05-15) preferred
 * `urlStandard` (~386px), which renders soft in the storefront PDP hero
 * (~512–960px slot). `urlZoom` (~1280px) is the print-quality master and
 * is the right source for both the hero and the Next.js image optimizer.
 *
 * Idempotent: skips products whose image URLs already match the desired
 * (urlZoom-preferred) list. Safe to re-run.
 *
 * Usage:
 *   # Local
 *   cd backend && IMPORT_DRY_RUN=1 npx medusa exec src/scripts/upgrade-ascolour-images-to-zoom.ts
 *   cd backend && npx medusa exec src/scripts/upgrade-ascolour-images-to-zoom.ts
 *
 *   # Railway
 *   cd /app/.medusa/server && IMPORT_DRY_RUN=1 npx medusa exec src/scripts/upgrade-ascolour-images-to-zoom.js
 *   cd /app/.medusa/server && npx medusa exec src/scripts/upgrade-ascolour-images-to-zoom.js
 *
 * Env vars:
 *   IMPORT_DRY_RUN=1  — log diffs without writing
 *   IMPORT_LIMIT=N    — process at most N products (default: all)
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"
import { AsColourImage } from "../modules/ascolour/types"

const PAGE_SIZE = 100

const extractArray = <T,>(resp: any): T[] => {
  if (!resp) return []
  if (Array.isArray(resp)) return resp as T[]
  return resp.items ?? resp.data ?? resp.results ?? []
}

const pickUrl = (img: any): string | undefined =>
  img.urlZoom || img.urlStandard || img.urlThumbnail || img.urlTiny

export default async function upgradeAsColourImagesToZoom({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  const productModule = container.resolve(Modules.PRODUCT) as unknown as {
    updateProducts?: (
      id: string,
      data: { thumbnail?: string; images?: Array<{ url: string }> }
    ) => Promise<unknown>
  }

  if (typeof productModule.updateProducts !== "function") {
    throw new Error("Product module updateProducts is unavailable")
  }

  const dryRun =
    process.env.IMPORT_DRY_RUN === "1" || process.env.IMPORT_DRY_RUN === "true"
  const limit = process.env.IMPORT_LIMIT
    ? Number.parseInt(process.env.IMPORT_LIMIT, 10)
    : undefined

  logger.info(
    `upgrade-ascolour-images-to-zoom: dryRun=${dryRun}, limit=${limit ?? "all"}`
  )

  let offset = 0
  let scanned = 0
  let candidates = 0
  let alreadyZoom = 0
  let missingStyleCode = 0
  let apiFailed = 0
  let updated = 0
  let stopped = false

  while (!stopped) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "thumbnail",
        "metadata",
        "images.url",
        "variants.metadata",
      ],
      pagination: { take: PAGE_SIZE, skip: offset },
    })

    if (!page?.length) break
    offset += page.length

    for (const product of page as any[]) {
      const meta = (product.metadata ?? {}) as Record<string, any>
      // The AS Colour importer stamps both top-level marker keys.
      const isAscolour =
        meta.source === "ascolour" || meta.ascolour?.styleCode

      if (!isAscolour) continue
      scanned++

      if (limit && scanned > limit) {
        stopped = true
        break
      }

      // Style code lives on product.metadata.ascolour.styleCode, with a
      // fallback to any variant's metadata.ascolour.styleCode (set by the
      // original importer for every variant).
      let styleCode: string | undefined = meta.ascolour?.styleCode
      if (!styleCode) {
        for (const v of product.variants ?? []) {
          const vmeta = (v.metadata ?? {}) as Record<string, any>
          if (vmeta.ascolour?.styleCode) {
            styleCode = vmeta.ascolour.styleCode
            break
          }
        }
      }
      if (!styleCode) {
        logger.warn(
          `  ${product.handle}: no styleCode in product or variant metadata — skipping`
        )
        missingStyleCode++
        continue
      }

      let images: AsColourImage[]
      try {
        const resp = await ascolour.getClient().getProductImages(styleCode)
        images = extractArray<AsColourImage>(resp)
      } catch (err: any) {
        logger.warn(
          `  ${product.handle} (${styleCode}): API fetch failed — ${err?.message ?? err}`
        )
        apiFailed++
        continue
      }

      const seen = new Set<string>()
      const newUrls: string[] = []
      for (const img of images as any[]) {
        const url = pickUrl(img)
        if (url && !seen.has(url)) {
          seen.add(url)
          newUrls.push(url)
        }
      }

      if (!newUrls.length) {
        logger.warn(
          `  ${product.handle} (${styleCode}): AS Colour returned no images — skipping`
        )
        continue
      }

      const currentUrls: string[] = (product.images ?? [])
        .map((i: any) => i.url as string)
        .filter(Boolean)

      const sameLength = currentUrls.length === newUrls.length
      const sameOrder = sameLength && currentUrls.every((u, i) => u === newUrls[i])
      if (sameOrder) {
        alreadyZoom++
        continue
      }

      candidates++
      const sampleBefore = currentUrls[0] ?? "(none)"
      const sampleAfter = newUrls[0]
      logger.info(
        `  ${product.handle} (${styleCode}): ${currentUrls.length} → ${newUrls.length} url(s); first: ${sampleBefore} → ${sampleAfter}`
      )

      if (dryRun) continue

      try {
        await productModule.updateProducts!(product.id, {
          thumbnail: newUrls[0],
          images: newUrls.map((url) => ({ url })),
        })
        updated++
      } catch (err: any) {
        logger.warn(
          `  ${product.handle} (${styleCode}): updateProducts failed — ${err?.message ?? err}`
        )
      }
    }

    if (page.length < PAGE_SIZE) break
  }

  logger.info(
    `Done. AS Colour products scanned: ${scanned}, already on zoom: ${alreadyZoom}, candidates: ${candidates}, ${dryRun ? "would update" : "updated"}: ${dryRun ? candidates : updated}, missing styleCode: ${missingStyleCode}, API failures: ${apiFailed}.`
  )
}
