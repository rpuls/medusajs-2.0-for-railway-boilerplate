import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  addToCartWorkflow,
  createCartWorkflow,
} from "@medusajs/medusa/core-flows"

import { GROUP_ORDER_MODULE } from "../../../../../../../modules/group-order"
import type GroupOrderModuleService from "../../../../../../../modules/group-order/service"
import { getPostHog } from "../../../../../../../lib/posthog"

type ParticipantLine = {
  participant_id: string
  name: string
  size_label: string
  quantity: number
  variant_id: string | null
  matched: boolean
  reason?: string
}

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

/**
 * POST /store/customers/me/group-orders/:id/convert-to-cart
 *   → { cart_id, lines_added, skipped: ParticipantLine[] }
 *
 * Builds a cart from a group order's participants. For each
 * participant, picks the variant on the base product whose title or
 * options match the participant's size_label (case-insensitive,
 * trimmed). Variants that can't be matched are reported in `skipped`
 * but the cart is still created so the owner can fix sizes manually.
 *
 * Idempotent on the side of the group order:
 *   - If the group order is already `converted` AND we have a recorded
 *     cart_id in metadata, return it without re-adding.
 *   - Otherwise build a fresh cart and stamp the id.
 *
 * Edge cases handled:
 *   - 0 participants → 400 ("nothing to convert").
 *   - Missing base_product_id → 400.
 *   - Base design has been deleted → cart still works, no design pre-load.
 *   - No region matching the storefront → 500 with clear message.
 *   - Size_label doesn't match any variant → skip + report.
 *   - Multiple variants match → pick the first deterministically.
 *   - Caller isn't the owner → 404 (don't leak existence).
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const groupOrderId = req.params.id
  if (!groupOrderId) {
    return res.status(400).json({ error: "id required" })
  }

  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  let groupOrder: any
  try {
    groupOrder = await service.retrieveGroupOrder(groupOrderId)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Group order not found.")
  }
  if (groupOrder.owner_customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Group order not found.")
  }

  // ---- Idempotency: already-converted → return existing cart ----
  const existingMeta = (groupOrder.metadata as Record<string, unknown>) ?? {}
  if (
    groupOrder.status === "converted" &&
    typeof existingMeta.cart_id === "string"
  ) {
    return res.json({
      cart_id: existingMeta.cart_id,
      lines_added: 0,
      skipped: [],
      already_converted: true,
    })
  }

  if (!groupOrder.base_product_id) {
    return res.status(400).json({
      error: "missing_base_product",
      detail:
        "This group order has no base product set. Add one before converting.",
    })
  }

  const participants = await service.listGroupOrderParticipants(
    { group_order_id: groupOrderId },
    { take: 1000 }
  )
  if (participants.length === 0) {
    return res.status(400).json({
      error: "no_participants",
      detail: "Add at least one participant before converting.",
    })
  }

  // ---- Resolve the base product's variants + match each participant ----
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.title",
      "variants.options.value",
      "variants.options.option.title",
    ],
    filters: { id: groupOrder.base_product_id },
  })
  const product = (products as any[])?.[0]
  if (!product) {
    return res.status(404).json({
      error: "product_not_found",
      detail:
        "The base product for this group order no longer exists. Pick a new product.",
    })
  }

  type Variant = {
    id: string
    title: string
    options?: Array<{ value?: string }>
  }
  const variants: Variant[] = product.variants ?? []

  const matchVariant = (sizeLabel: string): string | null => {
    const target = sizeLabel.trim().toLowerCase()
    if (!target) return null
    for (const v of variants) {
      const titleMatch = String(v.title ?? "").toLowerCase().includes(target)
      if (titleMatch) return v.id
      for (const o of v.options ?? []) {
        if (String(o.value ?? "").toLowerCase() === target) return v.id
      }
    }
    return null
  }

  const lines: ParticipantLine[] = participants.map((p: any) => {
    const variantId = matchVariant(p.size_label)
    return {
      participant_id: p.id,
      name: p.name,
      size_label: p.size_label,
      quantity: Math.max(1, Number(p.quantity ?? 1)),
      variant_id: variantId,
      matched: variantId !== null,
      reason: variantId === null ? "size_label did not match any variant" : undefined,
    }
  })

  const matched = lines.filter((l) => l.matched)
  if (matched.length === 0) {
    return res.status(400).json({
      error: "no_matching_variants",
      detail:
        "None of the participants' sizes matched the base product's variants.",
      skipped: lines,
    })
  }

  // ---- Pick a region + sales channel ----
  let regionId: string | null = null
  let salesChannelId: string | null = null
  try {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      pagination: { take: 50, skip: 0 },
    })
    regionId = (regions as any[])?.[0]?.id ?? null
  } catch {
    /* fallthrough */
  }
  if (!regionId) {
    return res.status(500).json({ error: "no_region_configured" })
  }
  try {
    const { data: channels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "is_disabled"],
      pagination: { take: 20, skip: 0 },
    })
    const live =
      (channels as any[])?.find((c) => c.is_disabled !== true) ??
      (channels as any[])?.[0]
    salesChannelId = live?.id ?? null
  } catch {
    /* fallthrough */
  }

  // Load the design (if any) so each cart line carries its
  // customizer_metadata for the customizer flow / production team.
  let designMetadata: Record<string, unknown> | null = null
  if (groupOrder.base_design_id) {
    try {
      const { data: designs } = await query.graph({
        entity: "design",
        fields: ["id", "customizer_metadata"],
        filters: { id: groupOrder.base_design_id },
      })
      const d = (designs as any[])?.[0]
      if (d?.customizer_metadata) {
        designMetadata = d.customizer_metadata as Record<string, unknown>
      }
    } catch {
      // Soft-fail; the cart still works without it.
    }
  }

  // ---- Build the cart ----
  const { result: cart } = await createCartWorkflow(req.scope).run({
    input: {
      region_id: regionId,
      sales_channel_id: salesChannelId ?? undefined,
      email: groupOrder.owner_email,
      currency_code: "aud",
      metadata: {
        source: "group_order_convert",
        group_order_id: groupOrderId,
        group_order_token: groupOrder.public_token,
      },
    },
  })

  let linesAdded = 0
  for (const line of matched) {
    try {
      await addToCartWorkflow(req.scope).run({
        input: {
          cart_id: cart.id,
          items: [
            {
              variant_id: line.variant_id as string,
              quantity: line.quantity,
              metadata: {
                group_order_participant_id: line.participant_id,
                group_order_participant_name: line.name,
                ...(designMetadata
                  ? { customizerDesign: designMetadata }
                  : {}),
              },
            },
          ],
        },
      })
      linesAdded += 1
    } catch (err: any) {
      // Move this line into the skipped list so the owner can see what failed.
      line.matched = false
      line.reason = `add_to_cart failed: ${err?.message ?? err}`
    }
  }

  // Stamp converted + cart_id on the group order itself.
  // Cast — the generated Medusa types for json-default fields are
  // narrower than what we actually store.
  await (service as any).updateGroupOrders([
    {
      id: groupOrderId,
      status: "converted",
      metadata: {
        ...existingMeta,
        cart_id: cart.id,
        converted_at: new Date().toISOString(),
        converted_lines: linesAdded,
      },
    },
  ])

  getPostHog()?.capture({
    distinctId: groupOrder.owner_email,
    event: "group order converted to cart",
    properties: {
      group_order_id: groupOrderId,
      cart_id: cart.id,
      lines_added: linesAdded,
      lines_skipped: lines.filter((l) => !l.matched).length,
    },
  })

  res.json({
    cart_id: cart.id,
    lines_added: linesAdded,
    skipped: lines.filter((l) => !l.matched),
  })
}
