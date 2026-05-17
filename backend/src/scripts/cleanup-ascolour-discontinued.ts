/**
 * One-shot cleanup: delete any imported AS Colour product whose
 * `metadata.ascolour.styleCode` ends in "S" (AS Colour's marker for a
 * superseded/discontinued style — verified empirically 2026-05-17:
 * 141/629 codes end in "S" with 75 paired base↔S styles, the
 * characteristic supersession pattern).
 *
 * Idempotent — safe to re-run.
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter backend medusa exec cleanup-ascolour-discontinued
 *   pnpm --filter backend medusa exec cleanup-ascolour-discontinued
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function cleanupAscolourDiscontinued({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"

  logger.info(`AS Colour discontinued-style cleanup — dryRun=${dryRun}`)

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
      if (meta?.source !== "ascolour") continue
      const styleCode = String(meta?.ascolour?.styleCode ?? "")
      if (!/S$/.test(styleCode)) continue
      toDelete.push({ id: p.id, handle: p.handle, metadata: meta })
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!toDelete.length) {
    logger.info("No discontinued AS Colour products found.")
    return
  }

  logger.info(`Found ${toDelete.length} discontinued AS Colour product(s) to delete:`)
  for (const p of toDelete) {
    logger.info(
      `  - ${p.handle} (styleCode=${p.metadata?.ascolour?.styleCode})`
    )
  }

  if (dryRun) {
    logger.info("Dry run — no deletions performed.")
    return
  }

  await deleteProductsWorkflow(container).run({
    input: { ids: toDelete.map((p) => p.id) },
  })

  logger.info(`Deleted ${toDelete.length} discontinued AS Colour product(s).`)
}
