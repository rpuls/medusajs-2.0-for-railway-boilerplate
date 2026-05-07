import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { DESIGNS_MODULE } from "../../../../../modules/designs"
import type DesignsModuleService from "../../../../../modules/designs/service"

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

const createBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  thumbnail_url: z.string().url().optional(),
  base_product_id: z.string().min(1).optional(),
  base_variant_id: z.string().min(1).optional(),
  customizer_metadata: z.record(z.string(), z.unknown()),
})

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const query = listQuerySchema.parse(req.query ?? {})
  const designsService = req.scope.resolve<DesignsModuleService>(DESIGNS_MODULE)

  const [designs, count] = await designsService.listAndCountDesigns(
    { customer_id: customerId },
    {
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
      order: { created_at: "DESC" },
    }
  )

  res.json({
    designs,
    count,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const body = createBodySchema.parse(req.body ?? {})
  const designsService = req.scope.resolve<DesignsModuleService>(DESIGNS_MODULE)

  const [created] = await designsService.createDesigns([
    {
      customer_id: customerId,
      name: body.name,
      thumbnail_url: body.thumbnail_url ?? null,
      base_product_id: body.base_product_id ?? null,
      base_variant_id: body.base_variant_id ?? null,
      customizer_metadata: body.customizer_metadata,
    },
  ])

  res.status(201).json({ design: created })
}
