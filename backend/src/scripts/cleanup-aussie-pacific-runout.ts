/**
 * One-shot cleanup of imported Aussie Pacific products.
 *
 * Two modes (mutually exclusive):
 *
 *   default       Delete products where `metadata.aussiepacific.run_out`
 *                 === true. Used after we changed the importer to skip
 *                 run_out styles entirely, to remove ones that landed
 *                 before the fix.
 *
 *   ALL=1         Delete every product where `metadata.source ===
 *                 "aussiepacific"`. Use this for a clean-slate re-import
 *                 after the taxonomy/tagging logic changes.
 *
 * Combine with DRY_RUN=1 to preview without deleting.
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter backend medusa exec cleanup-aussie-pacific-runout
 *   ALL=1 DRY_RUN=1 pnpm --filter backend medusa exec cleanup-aussie-pacific-runout
 *   ALL=1 pnpm --filter backend medusa exec cleanup-aussie-pacific-runout
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function cleanupAussiePacificRunOut({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const all = process.env.ALL === "1" || process.env.ALL === "true"

  logger.info(
    `Aussie Pacific cleanup — mode=${all ? "ALL aussiepacific products" : "run_out only"}, dryRun=${dryRun}`
  )

  // Walk every product with metadata.source === "aussiepacific" and
  // collect the ones we want to delete (run_out by default, all in ALL mode).
  type Row = { id: string; handle: string; metadata: any }
  const toDelete: Row[] = []
  const PAGE = 200
  let offset = 0
  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata"],
      pagination: { take: PAGE, skip: offset },
    })
    if (!page?.length) break
    for (const p of page as any[]) {
      const meta = p?.metadata ?? {}
      if (meta?.source !== "aussiepacific") continue
      if (all || meta?.aussiepacific?.run_out === true) {
        toDelete.push({ id: p.id, handle: p.handle, metadata: meta })
      }
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!toDelete.length) {
    logger.info("No matching AP products found. Nothing to delete.")
    return
  }

  logger.info(`Found ${toDelete.length} AP product(s) to delete:`)
  for (const p of toDelete) {
    logger.info(`  - ${p.handle} (${p.id})`)
  }

  if (dryRun) {
    logger.info("Dry run — no deletions performed.")
    return
  }

  await deleteProductsWorkflow(container).run({
    input: { ids: toDelete.map((p) => p.id) },
  })

  logger.info(`Deleted ${toDelete.length} AP product(s).`)
}
