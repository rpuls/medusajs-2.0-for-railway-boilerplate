import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { FREE_SHIPPING_TAGS } from "../../../../../lib/constants"

type ActivePerk = {
  perk: "free_shipping"
  granted_by_tag: string
}

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

/**
 * GET /store/customers/me/perks
 *   → { perks: ActivePerk[], tags: { label, color }[] }
 *
 * Returns the perks the authenticated customer is currently entitled
 * to based on their `customer_tag` rows. Drives the in-checkout "VIP
 * — free shipping" banner. Staff manually waive shipping at
 * fulfillment; perks are also stamped onto order.metadata when the
 * order is placed (see `subscribers/stamp-order-perks.ts`).
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let tags: Array<{ label: string; color?: string | null }> = []
  try {
    const { data } = await query.graph({
      entity: "customer_tag",
      fields: ["label", "color"],
      filters: { customer_id: customerId },
      pagination: { take: 200, skip: 0 },
    })
    tags = (data as any[])
      ?.map((t) => ({
        label: typeof t?.label === "string" ? t.label : "",
        color: typeof t?.color === "string" ? t.color : null,
      }))
      .filter((t) => t.label.length > 0) ?? []
  } catch {
    tags = []
  }

  const perks: ActivePerk[] = []
  for (const t of tags) {
    if (FREE_SHIPPING_TAGS.includes(t.label.toLowerCase())) {
      perks.push({ perk: "free_shipping", granted_by_tag: t.label })
      break
    }
  }

  res.json({ perks, tags })
}
