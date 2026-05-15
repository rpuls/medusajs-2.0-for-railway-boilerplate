import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { LOOKBOOK_MODULE } from "../../../modules/lookbook"
import type LookbookModuleService from "../../../modules/lookbook/service"

/**
 * Public lookbook list — only published items. Safe to expose
 * via the storefront with no auth.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<LookbookModuleService>(LOOKBOOK_MODULE)
  const items = await service.listLookbookItems(
    { is_published: true },
    { order: { weight: "ASC" }, take: 200 }
  )
  res.json({
    items: (items as any[]).map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      image_url: i.image_url,
      attribution: i.attribution,
      tags: (i.tags as { values?: string[] })?.values ?? [],
      product_ids: (i.product_ids as { ids?: string[] })?.ids ?? [],
    })),
  })
}
