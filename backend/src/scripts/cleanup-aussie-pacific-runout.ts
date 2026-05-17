/**
 * One-shot cleanup: delete any imported Aussie Pacific product whose
 * source style is run_out=true (discontinued).
 *
 * The first import run landed 5 products before we changed the importer
 * to skip run_out styles entirely. This script finds and deletes the
 * mistakenly-imported discontinued ones.
 *
 * Idempotent — safe to re-run; it only deletes products where
 * `metadata.aussiepacific.run_out === true`.
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter backend medusa exec cleanup-aussie-pacific-runout
 *   (drop DRY_RUN to apply)
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

  logger.info(`Aussie Pacific run-out cleanup — dryRun=${dryRun}`)

  // Walk every product with metadata.source === "aussiepacific" and
  // collect the ones marked discontinued.
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
      if (meta?.aussiepacific?.run_out === true) {
        toDelete.push({ id: p.id, handle: p.handle, metadata: meta })
      }
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!toDelete.length) {
    logger.info("No run-out AP products found. Nothing to delete.")
    return
  }

  logger.info(`Found ${toDelete.length} run-out AP product(s) to delete:`)
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

  logger.info(`Deleted ${toDelete.length} run-out AP product(s).`)
}
