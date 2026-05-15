import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { PRINT_RECIPE_MODULE } from "../../../../modules/print-recipe"
import type PrintRecipeModuleService from "../../../../modules/print-recipe/service"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  decoration_method: z
    .enum([
      "screen_print",
      "dtf",
      "embroidery",
      "uv",
      "digital_transfer",
      "vinyl",
      "other",
    ])
    .optional(),
  product_id: z.string().max(120).nullable().optional(),
  variant_id: z.string().max(120).nullable().optional(),
  design_id: z.string().max(120).nullable().optional(),
  customer_id: z.string().max(120).nullable().optional(),
  recipe_json: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().max(4000).nullable().optional(),
  is_archived: z.boolean().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
  let recipe: any
  try {
    recipe = await service.retrievePrintRecipe(id)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Recipe not found")
  }
  res.json({ recipe })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
  const update: Record<string, unknown> = { id }
  for (const k of Object.keys(body) as Array<keyof typeof body>) {
    if (body[k] !== undefined) (update as any)[k] = body[k]
  }
  await service.updatePrintRecipes([update])
  const updated = await service.retrievePrintRecipe(id)
  res.json({ recipe: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
  await service.deletePrintRecipes([id])
  res.json({ ok: true })
}
