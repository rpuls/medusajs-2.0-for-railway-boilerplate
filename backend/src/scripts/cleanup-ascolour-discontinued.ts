/**
 * One-shot cleanup: soft-disable any imported AS Colour product whose
 * `metadata.ascolour.styleCode` ends in "S" (AS Colour's marker for a
 * superseded/discontinued style — verified empirically 2026-05-17:
 * 141/629 codes end in "S" with 75 paired base↔S styles, the
 * characteristic supersession pattern).
 *
 * Unlike the Aussie Pacific run-out cleanup (which deletes) we do NOT
 * delete AS Colour products because customer orders almost certainly
 * reference them. Instead we:
 *   - set product.status = "draft"  (hides from storefront)
 *   - add the "Discontinued" tag  (so admin can see why)
 *   - leave variants, inventory, and link relationships untouched
 *
 * Idempotent — safe to re-run. Products already in draft + tagged are
 * skipped silently.
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter backend medusa exec cleanup-ascolour-discontinued
 *   pnpm --filter backend medusa exec cleanup-ascolour-discontinued
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  fetchAllProductTags,
  applyTypeAndTagsToProduct,
} from "../lib/product-type-tag-sync"

const DISCONTINUED_TAG = "Discontinued"

export default async function cleanupAscolourDiscontinued({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT) as any
  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"

  logger.info(`AS Colour discontinued-style cleanup — dryRun=${dryRun}`)

  // Walk every AS Colour-sourced product, find the ones whose ascolour
  // styleCode ends in "S".
  type Row = {
    id: string
    handle: string
    status: string
    metadata: any
    tags: Array<{ id: string; value: string }>
  }
  const toDisable: Row[] = []
  const PAGE = 200
  let offset = 0
  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "status", "metadata", "tags.id", "tags.value"],
      pagination: { take: PAGE, skip: offset },
    })
    if (!page?.length) break
    for (const p of page as any[]) {
      const meta = p?.metadata ?? {}
      if (meta?.source !== "ascolour") continue
      const styleCode = String(meta?.ascolour?.styleCode ?? "")
      if (!/S$/.test(styleCode)) continue
      toDisable.push({
        id: p.id,
        handle: p.handle,
        status: p.status,
        metadata: meta,
        tags: p.tags ?? [],
      })
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!toDisable.length) {
    logger.info("No discontinued AS Colour products found.")
    return
  }

  logger.info(`Found ${toDisable.length} discontinued AS Colour product(s):`)
  for (const p of toDisable) {
    logger.info(
      `  - ${p.handle} (styleCode=${p.metadata?.ascolour?.styleCode}, status=${p.status})`
    )
  }

  if (dryRun) {
    logger.info("Dry run — no updates performed.")
    return
  }

  // Cache the tag list once.
  const tagCache = await fetchAllProductTags(productModule)

  let updatedStatus = 0
  let alreadyDraft = 0
  let taggedOk = 0
  let taggedFail = 0
  for (const p of toDisable) {
    // 1. Flip status to DRAFT (skip if already draft)
    if (p.status !== "draft") {
      try {
        await productModule.updateProducts(p.id, {
          status: ProductStatus.DRAFT,
        })
        updatedStatus++
      } catch (err: any) {
        logger.warn(
          `Failed to set draft on ${p.handle}: ${err?.message ?? err}`
        )
        continue
      }
    } else {
      alreadyDraft++
    }

    // 2. Add the Discontinued tag (preserve existing tags)
    const existingTagValues = p.tags.map((t) => t.value)
    if (existingTagValues.includes(DISCONTINUED_TAG)) continue
    const tags = Array.from(new Set([...existingTagValues, DISCONTINUED_TAG]))
    try {
      await applyTypeAndTagsToProduct({
        productModule,
        productId: p.id,
        productType: null,
        tags,
        typeCache: new Map(),
        tagCache,
      })
      taggedOk++
    } catch (err: any) {
      taggedFail++
      logger.warn(
        `Failed to tag Discontinued on ${p.handle}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `Cleanup complete — status→draft: ${updatedStatus} (${alreadyDraft} already draft), tag-add ok: ${taggedOk}, tag-add fail: ${taggedFail}.`
  )
}
