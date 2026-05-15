import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BUNDLES_MODULE } from "../../../../modules/bundles"
import type BundlesModuleService from "../../../../modules/bundles/service"

const paramsSchema = z.object({ handle: z.string().min(1) })

type QueryLike = {
  graph: (q: Record<string, unknown>) => Promise<{ data?: unknown[] }>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = paramsSchema.parse(req.params ?? {})
  const bundleService =
    req.scope.resolve<BundlesModuleService>(BUNDLES_MODULE)

  const [bundles] = await bundleService.listAndCountBundles(
    { handle, status: "active" },
    { take: 1 }
  )
  const bundle = bundles[0]
  if (!bundle) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bundle "${handle}" not found.`
    )
  }

  const items = await bundleService.listBundleItems(
    { bundle_id: bundle.id },
    { order: { position: "ASC" } }
  )

  const productHandles = [...new Set(items.map((i) => i.product_handle))]

  let products: Record<string, unknown> = {}

  if (productHandles.length > 0) {
    const query = req.scope.resolve<QueryLike>(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "status",
        "metadata",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.metadata",
        "variants.options.id",
        "variants.options.value",
        "variants.options.option.id",
        "variants.options.option.title",
      ],
      filters: { handle: productHandles, status: "published" },
    })

    for (const p of data ?? []) {
      const prod = p as { handle: string }
      products[prod.handle] = p
    }
  }

  res.json({ bundle: { ...bundle, items }, products })
}
