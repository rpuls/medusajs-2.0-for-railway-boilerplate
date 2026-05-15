import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { GROUP_ORDER_MODULE } from "../../../../modules/group-order"
import type GroupOrderModuleService from "../../../../modules/group-order/service"

/**
 * GET /store/group-orders/:token
 *   → { group_order: {...}, participants: [...] }
 *
 * Public — no auth — so anyone with the share link can see the
 * group order details and the current participant roster. Only
 * fields safe to expose are included; never the owner_customer_id
 * or internal notes.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const token = req.params.token
  if (!token) return res.status(400).json({ error: "token required" })

  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  const [groupOrder] = await service.listGroupOrders({ public_token: token })
  if (!groupOrder) return res.status(404).json({ error: "not_found" })

  const participants = await service.listGroupOrderParticipants(
    { group_order_id: groupOrder.id },
    { order: { created_at: "ASC" }, take: 1000 }
  )

  res.json({
    group_order: {
      id: groupOrder.id,
      public_token: groupOrder.public_token,
      status: groupOrder.status,
      title: groupOrder.title,
      organisation_name: groupOrder.organisation_name,
      owner_name: groupOrder.owner_name,
      base_product_id: groupOrder.base_product_id,
      base_variant_id: groupOrder.base_variant_id,
      base_design_id: groupOrder.base_design_id,
      customizer_metadata: groupOrder.customizer_metadata,
      deadline_at: groupOrder.deadline_at,
      notes: groupOrder.notes,
    },
    participants: (participants as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      size_label: p.size_label,
      quantity: p.quantity,
      player_number: p.player_number,
      custom_notes: p.custom_notes,
      created_at: p.created_at,
    })),
  })
}
