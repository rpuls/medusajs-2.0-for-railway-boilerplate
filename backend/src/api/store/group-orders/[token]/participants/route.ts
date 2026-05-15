import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { GROUP_ORDER_MODULE } from "../../../../../modules/group-order"
import type GroupOrderModuleService from "../../../../../modules/group-order/service"
import { getPostHog } from "../../../../../lib/posthog"

const createSchema = z.object({
  name: z.string().min(1).max(120),
  size_label: z.string().min(1).max(40),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
  player_number: z.string().max(20).optional(),
  custom_notes: z.string().max(500).optional(),
  submitter_email: z.string().email().optional(),
})

/**
 * Public participant submission. Closed group orders reject new
 * participants so the share link stops accepting once the owner is
 * ready to convert.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const token = req.params.token
  if (!token) return res.status(400).json({ error: "token required" })

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  const [groupOrder] = await service.listGroupOrders({ public_token: token })
  if (!groupOrder) return res.status(404).json({ error: "not_found" })
  if (groupOrder.status !== "open") {
    return res.status(403).json({ error: "Group order is no longer accepting submissions." })
  }

  const [participant] = await service.createGroupOrderParticipants([
    {
      group_order_id: groupOrder.id,
      name: body.name.trim(),
      size_label: body.size_label.trim(),
      quantity: body.quantity,
      player_number: body.player_number ?? null,
      custom_notes: body.custom_notes ?? null,
      submitter_email: body.submitter_email?.toLowerCase() ?? null,
    },
  ])

  getPostHog()?.capture({
    distinctId: body.submitter_email?.toLowerCase() ?? `group-order:${groupOrder.id}`,
    event: "group order participant joined",
    properties: {
      group_order_id: groupOrder.id,
      size_label: body.size_label,
      quantity: body.quantity,
    },
  })

  res.status(201).json({ participant })
}
