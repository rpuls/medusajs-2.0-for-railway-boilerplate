import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

import { PRINT_RECIPE_MODULE } from "../../../../../modules/print-recipe"
import type PrintRecipeModuleService from "../../../../../modules/print-recipe/service"

const attachSchema = z.object({
  recipe_id: z.string().min(1),
})

/**
 * Order ↔ recipe association. Recipes live in their own table; the
 * link to a specific order is stored on `order.metadata.print_recipe_ids[]`
 * so the recipe can be looked up from the order without joining
 * tables on every render.
 *
 * GET   /admin/orders/:id/recipes        — list recipes linked to this order
 * POST  body: { recipe_id }              — link an existing recipe to this order
 * DELETE ?recipe_id=...                   — unlink
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Read the linked IDs from order metadata then hydrate from recipe table.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
    filters: { id: orderId },
  })
  const order = (orders as any[])?.[0]
  if (!order) return res.status(404).json({ error: "Order not found" })
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const recipeIds = Array.isArray(meta.print_recipe_ids)
    ? (meta.print_recipe_ids as unknown[]).filter(
        (v): v is string => typeof v === "string"
      )
    : []
  if (recipeIds.length === 0) return res.json({ recipes: [] })

  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
  const recipes = await service.listPrintRecipes({ id: recipeIds })
  res.json({ recipes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  let body: z.infer<typeof attachSchema>
  try {
    body = attachSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
    filters: { id: orderId },
  })
  const order = (orders as any[])?.[0]
  if (!order) return res.status(404).json({ error: "Order not found" })

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const existing = Array.isArray(meta.print_recipe_ids)
    ? (meta.print_recipe_ids as unknown[]).filter(
        (v): v is string => typeof v === "string"
      )
    : []
  if (existing.includes(body.recipe_id)) {
    return res.json({ ok: true, duplicate: true })
  }

  const orderModule = req.scope.resolve(
    require("@medusajs/framework/utils").Modules.ORDER
  ) as any
  await orderModule.updateOrders(orderId, {
    metadata: { ...meta, print_recipe_ids: [...existing, body.recipe_id] },
  })

  // Stamp `last_used_*` on the recipe so the library can show "recently used".
  try {
    const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
    await service.updatePrintRecipes([
      {
        id: body.recipe_id,
        last_used_order_id: orderId,
        last_used_at: new Date(),
      },
    ])
  } catch {
    // best-effort
  }

  res.json({ ok: true })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const recipeId = String((req.query?.recipe_id as string) ?? "")
  if (!recipeId) return res.status(400).json({ error: "recipe_id required" })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
    filters: { id: orderId },
  })
  const order = (orders as any[])?.[0]
  if (!order) return res.status(404).json({ error: "Order not found" })

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const existing = Array.isArray(meta.print_recipe_ids)
    ? (meta.print_recipe_ids as unknown[]).filter(
        (v): v is string => typeof v === "string"
      )
    : []
  const next = existing.filter((id) => id !== recipeId)

  const orderModule = req.scope.resolve(
    require("@medusajs/framework/utils").Modules.ORDER
  ) as any
  await orderModule.updateOrders(orderId, {
    metadata: { ...meta, print_recipe_ids: next },
  })

  res.json({ ok: true })
}
