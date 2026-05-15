import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { PRINT_RECIPE_MODULE } from "../../../modules/print-recipe"
import type PrintRecipeModuleService from "../../../modules/print-recipe/service"

const DECORATION_METHODS = [
  "screen_print",
  "dtf",
  "embroidery",
  "uv",
  "digital_transfer",
  "vinyl",
  "other",
] as const

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  decoration_method: z.enum(DECORATION_METHODS).default("screen_print"),
  product_id: z.string().max(120).optional(),
  variant_id: z.string().max(120).optional(),
  design_id: z.string().max(120).optional(),
  customer_id: z.string().max(120).optional(),
  recipe_json: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().max(4000).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const search = (req.query.q as string | undefined)?.trim().toLowerCase()
  const method = (req.query.decoration_method as string | undefined)?.trim()
  const productId = (req.query.product_id as string | undefined)?.trim()
  const customerId = (req.query.customer_id as string | undefined)?.trim()
  const includeArchived = String(req.query.include_archived ?? "").toLowerCase() === "true"

  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)

  const filters: Record<string, unknown> = {}
  if (method && DECORATION_METHODS.includes(method as any)) filters.decoration_method = method
  if (productId) filters.product_id = productId
  if (customerId) filters.customer_id = customerId
  if (!includeArchived) filters.is_archived = false

  let recipes = await service.listPrintRecipes(filters, {
    order: { last_used_at: "DESC" },
    take: 500,
  })

  if (search) {
    recipes = (recipes as any[]).filter((r) => {
      const haystack = [r.name, r.description, r.notes]
        .filter((s): s is string => typeof s === "string")
        .join(" ")
        .toLowerCase()
      return haystack.includes(search)
    })
  }

  res.json({ recipes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve<PrintRecipeModuleService>(PRINT_RECIPE_MODULE)
  const [created] = await service.createPrintRecipes([
    {
      name: body.name,
      description: body.description ?? null,
      decoration_method: body.decoration_method,
      product_id: body.product_id ?? null,
      variant_id: body.variant_id ?? null,
      design_id: body.design_id ?? null,
      customer_id: body.customer_id ?? null,
      recipe_json: body.recipe_json ?? {},
      notes: body.notes ?? null,
      created_by: (req as any).auth_context?.actor_id ?? null,
    },
  ])
  res.status(201).json({ recipe: created })
}
