import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { BUNDLES_MODULE } from "../../../modules/bundles"
import type BundlesModuleService from "../../../modules/bundles/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const [bundles] = await bundleService.listAndCountBundles(
    { status: "active" },
    { order: { created_at: "ASC" } }
  )

  const [allItems] = await bundleService.listAndCountBundleItems(
    {},
    { order: { position: "ASC" } }
  )

  const activeBundleIds = new Set(bundles.map((b) => b.id))
  const itemsByBundle = new Map<string, typeof allItems>()
  for (const item of allItems) {
    if (!activeBundleIds.has(item.bundle_id)) continue
    const existing = itemsByBundle.get(item.bundle_id) ?? []
    existing.push(item)
    itemsByBundle.set(item.bundle_id, existing)
  }

  const bundlesWithItems = bundles.map((b) => ({
    ...b,
    items: itemsByBundle.get(b.id) ?? [],
  }))

  res.json({ bundles: bundlesWithItems, count: bundles.length })
}
