import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  IOrderModuleService,
  INotificationModuleService,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { BOTTLE_SHOP_MODULE } from "../../../../../modules/bottle-shop"
import type BottleShopModuleService from "../../../../../modules/bottle-shop/service"
import { EmailTemplates } from "../../../../../modules/email-notifications/templates"
import {
  ASCOLOUR_WORKSHOP_COMPANY,
  ASCOLOUR_WORKSHOP_FIRST_NAME,
  ASCOLOUR_WORKSHOP_LAST_NAME,
  ASCOLOUR_WORKSHOP_ADDRESS_1,
  ASCOLOUR_WORKSHOP_ADDRESS_2,
  ASCOLOUR_WORKSHOP_CITY,
  ASCOLOUR_WORKSHOP_STATE,
  ASCOLOUR_WORKSHOP_ZIP,
  ASCOLOUR_WORKSHOP_COUNTRY_CODE,
  ASCOLOUR_WORKSHOP_EMAIL,
  ASCOLOUR_WORKSHOP_PHONE,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../../../../lib/constants"
import { getPostHog } from "../../../../../lib/posthog"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z
  .object({
    deliveryNotes: z.string().max(2000).optional(),
    /** Force-resend even if `bottle_shop_sent_at` is already set. */
    force: z.boolean().optional(),
  })
  .partial()

type PreviewItem = {
  lineItemId: string
  productTitle: string
  variantTitle: string | null
  quantity: number
  spiritType: string | null
  capacityMl: number | null
  externalCode: string | null
  bottleShopId: string | null
}

type ShopSummary = {
  id: string
  name: string
  email: string | null
}

const BOTTLE_SHOP_DEFAULT_EMAIL = process.env.BOTTLE_SHOP_DEFAULT_EMAIL?.trim() || null

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const { order, items, shops } = await loadOrderAndPreview(req, params.data.id)
  const meta = (order.metadata ?? {}) as Record<string, any>

  res.json({
    sent: Boolean(meta.bottle_shop_sent_at),
    bottle_shop_sent_at: meta.bottle_shop_sent_at ?? null,
    bottle_shop_email_to: meta.bottle_shop_email_to ?? null,
    bottle_shop_last_error: meta.bottle_shop_last_error ?? null,
    preview: {
      items,
      shops,
      shipTo: tryReadWorkshopAddress() ?? null,
    },
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const body = bodySchema.parse(req.body ?? {})

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  const notificationModuleService = req.scope.resolve<INotificationModuleService>(
    Modules.NOTIFICATION
  )

  const { order, items, shops } = await loadOrderAndPreview(req, params.data.id)
  const meta = (order.metadata ?? {}) as Record<string, any>

  if (!body.force && meta.bottle_shop_sent_at) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order already sent to a bottle shop at ${meta.bottle_shop_sent_at}. Pass force=true to resend.`
    )
  }

  if (!items.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No bottle line items found on this order. The line's product needs metadata.product_class = \"bottle\"."
    )
  }

  const shipTo = requireWorkshopAddress()
  const requestedBy =
    (req as any).auth_context?.actor_id ??
    (req as any).auth_context?.app_metadata?.user_id ??
    "admin"

  /**
   * Group items by their target bottle shop. A single Medusa order can fan out
   * to multiple shops if the customer added bottles supplied by different
   * partners. We dispatch one email per shop.
   */
  const itemsByShop = new Map<string, PreviewItem[]>()
  const noShopItems: PreviewItem[] = []
  for (const item of items) {
    if (!item.bottleShopId) {
      noShopItems.push(item)
      continue
    }
    const arr = itemsByShop.get(item.bottleShopId) ?? []
    arr.push(item)
    itemsByShop.set(item.bottleShopId, arr)
  }

  if (noShopItems.length && !BOTTLE_SHOP_DEFAULT_EMAIL) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${noShopItems.length} bottle line(s) have no metadata.bottle_shop_id and no BOTTLE_SHOP_DEFAULT_EMAIL is set.`
    )
  }
  if (noShopItems.length) {
    itemsByShop.set("__default__", noShopItems)
  }

  const orderDisplayId = String(
    (order as any).display_id ?? order.id
  )

  const dispatchedTo: string[] = []
  const errors: string[] = []

  for (const [shopId, shopItems] of itemsByShop.entries()) {
    let shopName: string
    let recipient: string | null

    if (shopId === "__default__") {
      shopName = "Bottle shop partner"
      recipient = BOTTLE_SHOP_DEFAULT_EMAIL
    } else {
      const shop = shops.find((s) => s.id === shopId)
      shopName = shop?.name ?? `Bottle shop ${shopId}`
      recipient = shop?.email ?? BOTTLE_SHOP_DEFAULT_EMAIL
    }

    if (!recipient) {
      errors.push(`No email on shop "${shopName}" and no BOTTLE_SHOP_DEFAULT_EMAIL fallback.`)
      continue
    }

    try {
      await notificationModuleService.createNotifications({
        to: recipient,
        channel: "email",
        template: EmailTemplates.BOTTLE_SHOP_ORDER,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: `Bottle order ${orderDisplayId} — ${shopItems.length} item${shopItems.length === 1 ? "" : "s"} to fulfil`,
          },
          orderDisplayId,
          orderId: order.id,
          shopName,
          items: shopItems.map((i) => ({
            productTitle: i.productTitle,
            variantTitle: i.variantTitle,
            quantity: i.quantity,
            spiritType: i.spiritType,
            capacityMl: i.capacityMl,
            externalCode: i.externalCode,
          })),
          shipTo,
          deliveryNotes: body.deliveryNotes ?? null,
          requestedBy: String(requestedBy),
        },
      })
      dispatchedTo.push(recipient)
    } catch (err: any) {
      errors.push(`Send to ${recipient} failed: ${err?.message ?? err}`)
    }
  }

  if (!dispatchedTo.length) {
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...meta,
        bottle_shop_last_error: errors.join(" | "),
      },
    })
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to send bottle-shop order: ${errors.join(" | ")}`
    )
  }

  const nowIso = new Date().toISOString()
  await orderModuleService.updateOrders(order.id, {
    metadata: {
      ...meta,
      bottle_shop_sent_at: nowIso,
      bottle_shop_email_to: dispatchedTo.join(", "),
      bottle_shop_item_count: items.length,
      bottle_shop_last_error: errors.length ? errors.join(" | ") : null,
    },
  })

  getPostHog()?.capture({
    distinctId: String(requestedBy),
    event: "bottle_shop_order_sent",
    properties: {
      order_id: order.id,
      order_display_id: orderDisplayId,
      shop_count: itemsByShop.size,
      item_count: items.length,
      partial_failure: errors.length > 0,
    },
  })

  res.json({
    ok: true,
    bottle_shop_sent_at: nowIso,
    dispatched_to: dispatchedTo,
    errors: errors.length ? errors : null,
  })
}

async function loadOrderAndPreview(req: MedusaRequest, orderId: string) {
  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY)
  const bottleShopService = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items"],
    })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order "${orderId}" not found.`)
  }

  const lineItems: any[] = order.items ?? []
  const variantIds = lineItems
    .map((li) => li.variant_id)
    .filter((v): v is string => typeof v === "string" && v.length > 0)

  let variantToProduct: Map<string, any> = new Map()
  if (variantIds.length) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "product.id",
        "product.title",
        "product.metadata",
      ],
      filters: { id: variantIds },
    })
    for (const v of variants ?? []) {
      variantToProduct.set(v.id as string, v)
    }
  }

  const items: PreviewItem[] = []
  const shopIds = new Set<string>()
  for (const li of lineItems) {
    const variantRow = li.variant_id ? variantToProduct.get(li.variant_id) : null
    const productMeta = (variantRow?.product?.metadata ?? {}) as Record<string, unknown>
    if (productMeta.product_class !== "bottle") continue
    const shopId =
      typeof productMeta.bottle_shop_id === "string"
        ? productMeta.bottle_shop_id
        : null
    if (shopId) shopIds.add(shopId)
    items.push({
      lineItemId: li.id,
      productTitle: variantRow?.product?.title ?? li.title ?? "(unknown)",
      variantTitle: variantRow?.title ?? li.variant_title ?? null,
      quantity: Number(li.quantity ?? 0),
      spiritType:
        typeof productMeta.spirit_type === "string"
          ? productMeta.spirit_type
          : null,
      capacityMl:
        typeof productMeta.bottle_capacity_ml === "number"
          ? productMeta.bottle_capacity_ml
          : null,
      externalCode:
        typeof productMeta.external_code === "string"
          ? productMeta.external_code
          : null,
      bottleShopId: shopId,
    })
  }

  let shops: ShopSummary[] = []
  if (shopIds.size) {
    const [shopRows] = await bottleShopService.listAndCountBottleShops(
      { id: Array.from(shopIds) },
      { take: shopIds.size }
    )
    shops = shopRows.map((s) => ({ id: s.id, name: s.name, email: s.email }))
  }

  return { order, items, shops }
}

function tryReadWorkshopAddress() {
  if (
    !ASCOLOUR_WORKSHOP_ADDRESS_1 ||
    !ASCOLOUR_WORKSHOP_CITY ||
    !ASCOLOUR_WORKSHOP_STATE ||
    !ASCOLOUR_WORKSHOP_ZIP
  ) {
    return null
  }
  return {
    company: ASCOLOUR_WORKSHOP_COMPANY,
    contactName:
      [ASCOLOUR_WORKSHOP_FIRST_NAME, ASCOLOUR_WORKSHOP_LAST_NAME]
        .filter(Boolean)
        .join(" ") || ASCOLOUR_WORKSHOP_COMPANY,
    addressLine1: ASCOLOUR_WORKSHOP_ADDRESS_1,
    addressLine2: ASCOLOUR_WORKSHOP_ADDRESS_2 || null,
    city: ASCOLOUR_WORKSHOP_CITY,
    state: ASCOLOUR_WORKSHOP_STATE,
    postalCode: ASCOLOUR_WORKSHOP_ZIP,
    country: ASCOLOUR_WORKSHOP_COUNTRY_CODE,
    phone: ASCOLOUR_WORKSHOP_PHONE || null,
    email: ASCOLOUR_WORKSHOP_EMAIL || null,
  }
}

function requireWorkshopAddress() {
  const addr = tryReadWorkshopAddress()
  if (!addr) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Workshop address incomplete. Set ASCOLOUR_WORKSHOP_ADDRESS_1, _CITY, _STATE, _ZIP — bottle shops ship here."
    )
  }
  return addr
}
