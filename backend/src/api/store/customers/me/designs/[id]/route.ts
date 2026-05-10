import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { DESIGNS_MODULE } from "../../../../../../modules/designs"
import type DesignsModuleService from "../../../../../../modules/designs/service"
import { getPostHog } from "../../../../../../lib/posthog"

const paramsSchema = z.object({ id: z.string().min(1) })

const updateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    thumbnail_url: z.string().url().nullable().optional(),
    customizer_metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (v) =>
      v.name !== undefined ||
      v.thumbnail_url !== undefined ||
      v.customizer_metadata !== undefined,
    { message: "Provide at least one field to update." }
  )

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

async function loadOwnedDesign(
  req: AuthenticatedMedusaRequest,
  designId: string,
  customerId: string
) {
  const designsService = req.scope.resolve<DesignsModuleService>(DESIGNS_MODULE)
  let design: any
  try {
    design = await designsService.retrieveDesign(designId)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Design "${designId}" was not found.`)
  }
  if (design.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Design "${designId}" was not found.`)
  }
  return { design, designsService }
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const params = paramsSchema.parse(req.params ?? {})
  const { design } = await loadOwnedDesign(req, params.id, customerId)
  res.json({ design })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const params = paramsSchema.parse(req.params ?? {})
  const body = updateBodySchema.parse(req.body ?? {})

  const { design, designsService } = await loadOwnedDesign(req, params.id, customerId)

  const [updated] = await designsService.updateDesigns([
    {
      id: design.id,
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.thumbnail_url !== undefined ? { thumbnail_url: body.thumbnail_url } : {}),
      ...(body.customizer_metadata !== undefined
        ? { customizer_metadata: body.customizer_metadata }
        : {}),
    },
  ])

  res.json({ design: updated })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const params = paramsSchema.parse(req.params ?? {})
  const { design, designsService } = await loadOwnedDesign(req, params.id, customerId)

  await designsService.deleteDesigns(design.id)

  getPostHog()?.capture({
    distinctId: customerId,
    event: "design deleted",
    properties: {
      design_id: design.id,
      design_name: design.name ?? null,
    },
  })

  res.json({ id: design.id, deleted: true })
}
