import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { z } from "zod"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z.object({
  /** When true, mark the product as a bottle so it routes through the bottle customizer + spirits taxonomy. */
  product_class_bottle: z.boolean().optional(),
  spirit_type: z
    .enum([
      "vodka",
      "gin",
      "whisky",
      "rum",
      "tequila",
      "cognac",
      "champagne",
      "liqueur",
      "mezcal",
    ])
    .nullable()
    .optional(),
  bottle_capacity_ml: z.number().int().positive().max(10000).nullable().optional(),
  bottle_label_dimensions_cm: z
    .object({
      width: z.number().positive().max(60),
      height: z.number().positive().max(60),
    })
    .nullable()
    .optional(),
  bottle_back_label_dimensions_cm: z
    .object({
      width: z.number().positive().max(60),
      height: z.number().positive().max(60),
    })
    .nullable()
    .optional(),
  bottle_shop_id: z.string().min(1).nullable().optional(),
})

/**
 * GET — returns the current bottle-related metadata for the product.
 * POST — patches `product.metadata` with the bottle fields, preserving any
 * unrelated keys.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.parse(req.params ?? {})
  const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    filters: { id: params.id },
  })
  const product = data?.[0]
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product "${params.id}" not found.`)
  }

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  res.json({
    product_id: product.id,
    product_class: meta.product_class ?? null,
    spirit_type: meta.spirit_type ?? null,
    bottle_capacity_ml:
      typeof meta.bottle_capacity_ml === "number" ? meta.bottle_capacity_ml : null,
    bottle_label_dimensions_cm: meta.bottle_label_dimensions_cm ?? null,
    bottle_back_label_dimensions_cm: meta.bottle_back_label_dimensions_cm ?? null,
    bottle_shop_id:
      typeof meta.bottle_shop_id === "string" ? meta.bottle_shop_id : null,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.parse(req.params ?? {})
  const body = bodySchema.parse(req.body ?? {})

  const productModule = req.scope.resolve<any>(Modules.PRODUCT)
  const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    filters: { id: params.id },
  })
  const product = data?.[0]
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product "${params.id}" not found.`)
  }

  const existing = (product.metadata ?? {}) as Record<string, unknown>
  const next: Record<string, unknown> = { ...existing }

  if (body.product_class_bottle !== undefined) {
    if (body.product_class_bottle) {
      next.product_class = "bottle"
    } else if (existing.product_class === "bottle") {
      delete next.product_class
    }
  }
  if (body.spirit_type !== undefined) {
    if (body.spirit_type === null) delete next.spirit_type
    else next.spirit_type = body.spirit_type
  }
  if (body.bottle_capacity_ml !== undefined) {
    if (body.bottle_capacity_ml === null) delete next.bottle_capacity_ml
    else next.bottle_capacity_ml = body.bottle_capacity_ml
  }
  if (body.bottle_label_dimensions_cm !== undefined) {
    if (body.bottle_label_dimensions_cm === null) delete next.bottle_label_dimensions_cm
    else next.bottle_label_dimensions_cm = body.bottle_label_dimensions_cm
  }
  if (body.bottle_back_label_dimensions_cm !== undefined) {
    if (body.bottle_back_label_dimensions_cm === null)
      delete next.bottle_back_label_dimensions_cm
    else next.bottle_back_label_dimensions_cm = body.bottle_back_label_dimensions_cm
  }
  if (body.bottle_shop_id !== undefined) {
    if (body.bottle_shop_id === null) delete next.bottle_shop_id
    else next.bottle_shop_id = body.bottle_shop_id
  }

  await productModule.updateProducts(params.id, { metadata: next })

  res.json({ ok: true, metadata: next })
}
