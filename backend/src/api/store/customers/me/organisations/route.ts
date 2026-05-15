import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { ORGANISATION_MODULE } from "../../../../../modules/organisation"
import type OrganisationModuleService from "../../../../../modules/organisation/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  const memberships = await service.listOrganisationMembers(
    { customer_id: customerId },
    { take: 50 }
  )
  if (memberships.length === 0) return res.json({ organisations: [] })
  const orgIds = memberships.map((m: any) => m.organisation_id)
  const orgs = await service.listOrganisations({ id: orgIds })
  const byId = new Map<string, any>()
  for (const o of orgs as any[]) byId.set(o.id, o)
  res.json({
    organisations: memberships.map((m: any) => ({
      organisation: byId.get(m.organisation_id) ?? null,
      role: m.role,
      joined_at: m.accepted_at,
    })),
  })
}
