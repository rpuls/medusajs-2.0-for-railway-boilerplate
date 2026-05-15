import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { ORGANISATION_MODULE } from "../../../modules/organisation"
import type OrganisationModuleService from "../../../modules/organisation/service"

const createSchema = z.object({
  handle: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  abn: z.string().max(40).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
  default_pricing_tier: z.string().max(60).optional(),
  tax_exempt: z.boolean().optional(),
  tax_exempt_reason: z.string().max(200).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const search = (req.query.q as string | undefined)?.trim().toLowerCase()
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  let orgs = await service.listOrganisations({}, { order: { name: "ASC" }, take: 500 })
  if (search) {
    orgs = (orgs as any[]).filter((o) =>
      [o.name, o.handle, o.contact_email, o.abn]
        .filter((v): v is string => typeof v === "string")
        .some((v) => v.toLowerCase().includes(search))
    )
  }
  res.json({ organisations: orgs })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve<OrganisationModuleService>(ORGANISATION_MODULE)
  const handle = body.handle.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
  const [created] = await service.createOrganisations([
    {
      handle,
      name: body.name,
      abn: body.abn ?? null,
      contact_email: body.contact_email ?? null,
      contact_phone: body.contact_phone ?? null,
      notes: body.notes ?? null,
      default_pricing_tier: body.default_pricing_tier ?? null,
      tax_exempt: body.tax_exempt ?? false,
      tax_exempt_reason: body.tax_exempt_reason ?? null,
    },
  ])
  res.status(201).json({ organisation: created })
}
