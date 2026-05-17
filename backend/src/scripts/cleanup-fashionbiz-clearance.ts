/**
 * One-shot cleanup: delete any imported FashionBiz product whose source
 * style has `sales_status === "clearance"`.
 *
 * The FashionBiz importer used to ingest every product regardless of
 * sales_status; clearance items are styles FashionBiz is running out
 * (end-of-life). We don't want them on the storefront.
 *
 * Idempotent — safe to re-run. Compares against
 * `metadata.fashionbiz.sales_status` (set by the importer on every
 * product) and only deletes products where it equals "clearance"
 * (case-insensitive).
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter backend medusa exec cleanup-fashionbiz-clearance
 *   (drop DRY_RUN to apply)
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function cleanupFashionBizClearance({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"

  logger.info(`FashionBiz clearance cleanup — dryRun=${dryRun}`)

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
      if (meta?.source !== "fashionbiz") continue
      const salesStatus = (meta?.fashionbiz?.sales_status ?? "")
        .toString()
        .trim()
        .toLowerCase()
      if (salesStatus === "clearance") {
        toDelete.push({ id: p.id, handle: p.handle, metadata: meta })
      }
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!toDelete.length) {
    logger.info("No clearance FashionBiz products found. Nothing to delete.")
    return
  }

  logger.info(`Found ${toDelete.length} clearance FashionBiz product(s) to delete:`)
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

  logger.info(`Deleted ${toDelete.length} clearance FashionBiz product(s).`)
}
