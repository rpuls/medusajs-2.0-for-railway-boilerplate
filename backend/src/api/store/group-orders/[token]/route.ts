import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

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

  // ---- Hydrate design preview + product info for the public page.
  // Safe-to-expose subset only: thumbnail, design name, base product
  // title + handle + available variant sizes. Never the customizer
  // metadata's source-file URLs (which can leak customer originals).
  let designPreview: {
    name: string | null
    thumbnail_url: string | null
  } | null = null
  let productPreview: {
    title: string | null
    handle: string | null
    thumbnail: string | null
    available_sizes: string[]
  } | null = null
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    if (groupOrder.base_design_id) {
      const { data: designs } = await query.graph({
        entity: "design",
        fields: ["id", "name", "thumbnail_url"],
        filters: { id: groupOrder.base_design_id },
      })
      const design = (designs as any[])?.[0]
      if (design) {
        designPreview = {
          name: typeof design.name === "string" ? design.name : null,
          thumbnail_url:
            typeof design.thumbnail_url === "string"
              ? design.thumbnail_url
              : null,
        }
      }
    }
    if (groupOrder.base_product_id) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "handle",
          "thumbnail",
          "variants.id",
          "variants.title",
          "variants.options.value",
        ],
        filters: { id: groupOrder.base_product_id },
      })
      const product = (products as any[])?.[0]
      if (product) {
        const sizes = new Set<string>()
        for (const v of product.variants ?? []) {
          if (typeof v?.title === "string") sizes.add(v.title)
          for (const o of v?.options ?? []) {
            if (typeof o?.value === "string") sizes.add(o.value)
          }
        }
        productPreview = {
          title: typeof product.title === "string" ? product.title : null,
          handle: typeof product.handle === "string" ? product.handle : null,
          thumbnail:
            typeof product.thumbnail === "string" ? product.thumbnail : null,
          available_sizes: Array.from(sizes).slice(0, 30),
        }
      }
    }
  } catch {
    // Soft fail — the public page renders fine without previews.
  }

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
      // Don't expose raw customizer_metadata to the public page —
      // can contain MinIO URLs to customer source artwork.
      deadline_at: groupOrder.deadline_at,
      notes: groupOrder.notes,
    },
    design_preview: designPreview,
    product_preview: productPreview,
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
