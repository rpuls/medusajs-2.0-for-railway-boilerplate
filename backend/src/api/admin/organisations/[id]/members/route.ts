import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { ORGANISATION_MODULE } from "../../../../../modules/organisation"
import type OrganisationModuleService from "../../../../../modules/organisation/service"

const addSchema = z.object({
  customer_id: z.string().min(1),
  role: z.enum(["owner", "purchaser", "viewer"]).default("purchaser"),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orgId = req.params.id
  let body: z.infer<typeof addSchema>
  try {
    body = addSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  const existing = await service.listOrganisationMembers({
    organisation_id: orgId,
    customer_id: body.customer_id,
  })
  if (existing.length > 0) {
    return res.json({ member: existing[0], duplicate: true })
  }
  const [created] = await service.createOrganisationMembers([
    {
      organisation_id: orgId,
      customer_id: body.customer_id,
      role: body.role,
      invited_by: (req as any).auth_context?.actor_id ?? null,
      accepted_at: new Date(),
    },
  ])
  res.status(201).json({ member: created })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orgId = req.params.id
  const customerId = String((req.query?.customer_id as string) ?? "")
  if (!customerId) {
    return res.status(400).json({ error: "customer_id required" })
  }
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  const matches = await service.listOrganisationMembers({
    organisation_id: orgId,
    customer_id: customerId,
  })
  if (matches.length === 0) return res.json({ ok: true })
  await service.deleteOrganisationMembers(matches.map((m: any) => m.id))
  res.json({ ok: true })
}
