import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ulid } from "ulid"
import { z } from "zod"

import { GROUP_ORDER_MODULE } from "../../../modules/group-order"
import type GroupOrderModuleService from "../../../modules/group-order/service"
import { getPostHog } from "../../../lib/posthog"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  organisation_name: z.string().max(200).optional(),
  owner_email: z.string().min(3).max(200),
  owner_name: z.string().max(200).optional(),
  base_product_id: z.string().min(1).max(120).optional(),
  base_variant_id: z.string().min(1).max(120).optional(),
  base_design_id: z.string().min(1).max(120).optional(),
  customizer_metadata: z.record(z.string(), z.unknown()).optional(),
  deadline_at: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
})

function makePublicToken() {
  // Half-length ULID + random chars — short enough to share, hard to guess.
  return `${ulid().slice(-12).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  const ownerCustomerId = req.auth_context?.actor_id ?? null

  const [created] = await service.createGroupOrders([
    {
      public_token: makePublicToken(),
      status: "open",
      title: body.title,
      organisation_name: body.organisation_name ?? null,
      owner_customer_id: ownerCustomerId,
      owner_email: body.owner_email.trim().toLowerCase(),
      owner_name: body.owner_name ?? null,
      base_product_id: body.base_product_id ?? null,
      base_variant_id: body.base_variant_id ?? null,
      base_design_id: body.base_design_id ?? null,
      customizer_metadata: body.customizer_metadata ?? {},
      deadline_at: body.deadline_at ? new Date(body.deadline_at) : null,
      notes: body.notes ?? null,
    },
  ])

  getPostHog()?.capture({
    distinctId: body.owner_email.toLowerCase(),
    event: "group order created",
    properties: {
      group_order_id: created.id,
      title: body.title,
      organisation_name: body.organisation_name ?? null,
    },
  })

  res.status(201).json({ group_order: created })
}
