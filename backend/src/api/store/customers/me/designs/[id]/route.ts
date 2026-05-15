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

  // If the customizer payload is changing, snapshot the OLD state into
  // a design_version row before mutating the live design. Rename- and
  // thumbnail-only updates don't create a version (avoids polluting
  // the history with cosmetic changes).
  let snapshottedVersion: number | null = null
  if (body.customizer_metadata !== undefined) {
    const existingVersions = await designsService.listDesignVersions(
      { design_id: design.id },
      { order: { version: "DESC" }, take: 1 }
    )
    const nextVersion =
      ((existingVersions as Array<{ version: number }>)[0]?.version ?? 0) + 1
    await designsService.createDesignVersions([
      {
        design_id: design.id,
        customer_id: customerId,
        version: nextVersion,
        name: design.name,
        thumbnail_url: design.thumbnail_url ?? null,
        base_product_id: design.base_product_id ?? null,
        base_variant_id: design.base_variant_id ?? null,
        customizer_metadata: design.customizer_metadata,
      },
    ])
    snapshottedVersion = nextVersion
  }

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

  getPostHog()?.capture({
    distinctId: customerId,
    event: "design updated",
    properties: {
      design_id: design.id,
      updated_name: body.name !== undefined,
      updated_thumbnail: body.thumbnail_url !== undefined,
      updated_metadata: body.customizer_metadata !== undefined,
      snapshotted_version: snapshottedVersion,
    },
  })

  res.json({ design: updated, snapshotted_version: snapshottedVersion })
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
