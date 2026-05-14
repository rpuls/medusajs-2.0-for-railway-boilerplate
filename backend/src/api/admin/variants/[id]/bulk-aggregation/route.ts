import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { z } from "zod"

const bodySchema = z.object({
  exclude_from_bulk_aggregation: z.boolean(),
})

/**
 * POST /admin/variants/:id/bulk-aggregation
 *
 * Sets (or clears) the cross-cart bulk-aggregation opt-out flag on a variant.
 * Used by the admin widget to mark niche SKUs (e.g. DTF gang sheet) as not
 * participating in the aggregated tier discount across the cart.
 *
 * Stores under `variant.metadata.exclude_from_bulk_aggregation` (boolean).
 * The recompute helper in `lib/recompute-scp-cart-pricing.ts` reads this
 * flag when deciding which lines aggregate.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const variantId = (req.params ?? {}).id
  if (!variantId || typeof variantId !== "string") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing variant id.")
  }

  const parsed = bodySchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid payload: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (q: Record<string, unknown>) => Promise<{ data?: unknown[] }>
  }

  const { data: variants } = await query.graph({
    entity: "variants",
    filters: { id: variantId },
    fields: ["id", "metadata"],
  })

  const variant = variants?.[0] as
    | { id?: string; metadata?: Record<string, unknown> | null }
    | undefined

  if (!variant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Variant not found.")
  }

  const existingMeta = (variant.metadata ?? {}) as Record<string, unknown>
  const nextMeta: Record<string, unknown> = {
    ...existingMeta,
    exclude_from_bulk_aggregation: parsed.data.exclude_from_bulk_aggregation,
  }
  if (parsed.data.exclude_from_bulk_aggregation === false) {
    // Clean up the flag when set back to the default — keeps variant metadata
    // tidy and ensures any downstream truthy-check on the raw key isn't
    // confused by a literal `false` we wrote earlier.
    delete nextMeta.exclude_from_bulk_aggregation
  }

  const productModuleService = req.scope.resolve(Modules.PRODUCT) as {
    updateProductVariants: (id: string, data: { metadata: Record<string, unknown> }) => Promise<unknown>
  }
  await productModuleService.updateProductVariants(variantId, {
    metadata: nextMeta,
  })

  return res.status(200).json({
    ok: true,
    variant_id: variantId,
    exclude_from_bulk_aggregation: parsed.data.exclude_from_bulk_aggregation,
  })
}
