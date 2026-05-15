import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { DESIGNS_MODULE } from "../../../../../../../../modules/designs"
import type DesignsModuleService from "../../../../../../../../modules/designs/service"
import { getPostHog } from "../../../../../../../../lib/posthog"

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

/**
 * POST /store/customers/me/designs/:id/versions/:version
 *   → restores the named version onto the live design row.
 *
 * Restoration itself snapshots the CURRENT design first so the
 * customer can undo. So restoring v3 creates v4 (a snapshot of the
 * live state pre-restore) and overwrites the live row with v3's
 * payload.
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const designId = req.params.id
  const versionNum = Number.parseInt(req.params.version ?? "", 10)
  if (!Number.isFinite(versionNum)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "version must be a number")
  }

  const designsService = req.scope.resolve<DesignsModuleService>(DESIGNS_MODULE)

  let design: any
  try {
    design = await designsService.retrieveDesign(designId)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Design not found.")
  }
  if (design.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Design not found.")
  }

  const [target] = await designsService.listDesignVersions({
    design_id: designId,
    version: versionNum,
  })
  if (!target) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Version not found.")
  }

  // Snapshot current state before overwriting (lets the customer undo).
  const allVersions = await designsService.listDesignVersions(
    { design_id: designId },
    { order: { version: "DESC" }, take: 1 }
  )
  const nextVersion = ((allVersions as Array<{ version: number }>)[0]?.version ?? 0) + 1
  await designsService.createDesignVersions([
    {
      design_id: designId,
      customer_id: customerId,
      version: nextVersion,
      name: design.name,
      thumbnail_url: design.thumbnail_url ?? null,
      base_product_id: design.base_product_id ?? null,
      base_variant_id: design.base_variant_id ?? null,
      customizer_metadata: design.customizer_metadata,
    },
  ])

  const [updated] = await designsService.updateDesigns([
    {
      id: designId,
      name: (target as any).name,
      thumbnail_url: (target as any).thumbnail_url ?? null,
      customizer_metadata: (target as any).customizer_metadata,
    },
  ])

  getPostHog()?.capture({
    distinctId: customerId,
    event: "design version restored",
    properties: {
      design_id: designId,
      restored_version: versionNum,
      snapshotted_version: nextVersion,
    },
  })

  res.json({
    design: updated,
    restored_version: versionNum,
    snapshotted_version: nextVersion,
  })
}
