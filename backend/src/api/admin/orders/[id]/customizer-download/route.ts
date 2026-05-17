import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { buildLineCustomizerExport } from "../../../../../lib/customizer-order-artifacts"

const paramsSchema = z.object({
  id: z.string().min(1),
})

/**
 * GET /admin/orders/:id/customizer-download
 *
 * Admin-authenticated JSON listing print file URLs and mockup preview URLs per line item,
 * sourced from `metadata.customizerDesign` saved at add-to-cart.
 *
 * Each line also includes `product_handle` and `variant_id` so admin widgets can
 * build deep-links back to the storefront customiser (e.g. for the "Customise
 * position" proof feature).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsedParams = paramsSchema.safeParse(req.params ?? {})
  if (!parsedParams.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid order id: ${parsedParams.error.message}`
    )
  }

  const orderId = parsedParams.data.id
  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)

  let order: Awaited<ReturnType<IOrderModuleService["retrieveOrder"]>>
  try {
    order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items"],
    })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order "${orderId}" was not found.`)
  }

  type LineShape = Parameters<typeof buildLineCustomizerExport>[0]
  type RawItem = LineShape & { product_id?: string | null; variant_id?: string | null }
  const rawItems = (order as { items?: RawItem[] }).items ?? []
  const lines = rawItems.map((line) => buildLineCustomizerExport(line))

  // Batch-fetch product handles so the admin widget can build customiser URLs.
  const productIds = [...new Set(rawItems.map((i) => i.product_id).filter(Boolean) as string[])]
  const productHandleMap = new Map<string, string>()
  if (productIds.length > 0) {
    try {
      const productModule = req.scope.resolve(Modules.PRODUCT) as any
      const products: Array<{ id: string; handle: string | null }> = await productModule.listProducts(
        { id: productIds },
        { select: ["id", "handle"] }
      )
      for (const p of products) {
        if (p.id && p.handle) productHandleMap.set(p.id, p.handle)
      }
    } catch {
      // Non-critical — widget falls back to disabling the button
    }
  }

  // Build a lookup by line_item_id for the raw item fields
  const itemMetaMap = new Map<string, { product_id: string | null; variant_id: string | null }>()
  for (const item of rawItems) {
    itemMetaMap.set(item.id, {
      product_id: item.product_id ?? null,
      variant_id: item.variant_id ?? null,
    })
  }

  const enrichedLines = lines.map((line) => {
    const raw = itemMetaMap.get(line.line_item_id)
    const productId = raw?.product_id ?? null
    return {
      ...line,
      product_handle: productId ? (productHandleMap.get(productId) ?? null) : null,
      variant_id: raw?.variant_id ?? null,
    }
  })

  const displayId = (order as { display_id?: unknown }).display_id
  const display_id =
    typeof displayId === "number" ? displayId : typeof displayId === "string" ? displayId : null

  return res.status(200).json({
    order_id: order.id ?? orderId,
    display_id,
    lines: enrichedLines,
  })
}
