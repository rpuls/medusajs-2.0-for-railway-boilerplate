import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { DESIGNS_MODULE } from "../../../../../../../modules/designs"
import type DesignsModuleService from "../../../../../../../modules/designs/service"

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

/**
 * GET /store/customers/me/designs/:id/versions
 *
 * Lists prior versions of the design, newest first. The "live" design
 * row is the current state — versions are the *historical* snapshots
 * taken at each save.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const designId = req.params.id
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

  const versions = await designsService.listDesignVersions(
    { design_id: designId },
    { order: { version: "DESC" }, take: 100 }
  )

  res.json({ versions })
}
