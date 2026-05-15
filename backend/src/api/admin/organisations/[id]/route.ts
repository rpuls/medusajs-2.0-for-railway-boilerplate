import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { ORGANISATION_MODULE } from "../../../../modules/organisation"
import type OrganisationModuleService from "../../../../modules/organisation/service"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  abn: z.string().max(40).nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().max(40).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  default_pricing_tier: z.string().max(60).nullable().optional(),
  tax_exempt: z.boolean().optional(),
  tax_exempt_reason: z.string().max(200).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  let org: any
  try {
    org = await service.retrieveOrganisation(id)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
  const members = await service.listOrganisationMembers(
    { organisation_id: id },
    { take: 500 }
  )
  res.json({ organisation: org, members })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const update: Record<string, unknown> = { id }
  for (const k of Object.keys(body) as Array<keyof typeof body>) {
    if (body[k] !== undefined) (update as any)[k] = body[k]
  }
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  await service.updateOrganisations([update])
  const updated = await service.retrieveOrganisation(id)
  res.json({ organisation: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  await service.deleteOrganisations([id])
  res.json({ ok: true })
}
