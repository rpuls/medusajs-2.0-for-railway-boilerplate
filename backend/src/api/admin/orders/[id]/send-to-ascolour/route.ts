import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { ASCOLOUR_MODULE } from "../../../../../modules/ascolour"
import AsColourService from "../../../../../modules/ascolour/service"
import {
  AsColourCreateOrderItem,
  AsColourCreateOrderRequest,
} from "../../../../../modules/ascolour/types"
import { getPostHog } from "../../../../../lib/posthog"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z
  .object({
    shippingMethod: z.string().min(1).optional(),
    orderNotes: z.string().optional(),
    courierInstructions: z.string().optional(),
    overrideItems: z
      .array(
        z.object({
          sku: z.string(),
          warehouse: z.string(),
          quantity: z.number().int().positive(),
        })
      )
      .optional(),
  })
  .partial()

/**
 * GET /admin/orders/:id/send-to-ascolour
 *
 * Returns the AS Colour order metadata that has already been recorded against
 * the Medusa order plus a "preview" of what would be sent if POSTed now.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }

  const { order, ascolour } = await loadOrderAndModule(req, params.data.id)
  const meta = (order.metadata ?? {}) as Record<string, any>
  const preview = await buildOrderPreview({ order, ascolour })

  return res.json({
    sent: Boolean(meta.ascolour_order_id),
    ascolour_order_id: meta.ascolour_order_id ?? null,
    ascolour_status: meta.ascolour_status ?? null,
    ascolour_sent_at: meta.ascolour_sent_at ?? null,
    ascolour_shipments: Array.isArray(meta.ascolour_shipments)
      ? meta.ascolour_shipments
      : [],
    ascolour_last_synced_at: meta.ascolour_last_synced_at ?? null,
    last_sync_error: meta.ascolour_last_sync_error ?? null,
    last_error: meta.ascolour_last_error ?? null,
    preview,
  })
}

/**
 * POST /admin/orders/:id/send-to-ascolour
 *
 * Builds the AS Colour dropship order payload for the AS Colour line items in
 * this Medusa order and POSTs it to /v1/orders. Stores the returned order id
 * + status in `metadata.ascolour_*`. Idempotent: refuses to send twice.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const body = bodySchema.parse(req.body ?? {})

  const { order, ascolour, orderModuleService } = await loadOrderAndModule(req, params.data.id)
  const meta = (order.metadata ?? {}) as Record<string, any>

  if (meta.ascolour_order_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order already sent to AS Colour as ${meta.ascolour_order_id}.`
    )
  }

  const opts = ascolour.getOptions()
  const items: AsColourCreateOrderItem[] = body.overrideItems ?? (await buildItems(order, ascolour))

  if (!items.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No AS Colour line items found on this order."
    )
  }

  const shippingMethod =
    body.shippingMethod ?? opts.default_shipping_method
  if (!shippingMethod) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No shippingMethod provided and ASCOLOUR_DEFAULT_SHIPPING_METHOD is unset."
    )
  }

  const reference = String((order as any).display_id ?? order.id)

  const payload: AsColourCreateOrderRequest = {
    reference,
    shippingMethod,
    orderNotes:
      body.orderNotes ?? `Decoration order — ship to SC Prints workshop. Medusa order ${reference}.`,
    courierInstructions: body.courierInstructions,
    shippingAddress: opts.workshop_address,
    items,
  }

  try {
    const ascolourOrder = await ascolour.createDropshipOrder(payload)
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...meta,
        ascolour_order_id: ascolourOrder.id,
        ascolour_status: ascolourOrder.status ?? "Pending",
        ascolour_sent_at: new Date().toISOString(),
        ascolour_last_error: null,
      },
    })
    const adminId =
      (req as any).auth_context?.actor_id ??
      (req as any).auth_context?.app_metadata?.user_id ??
      "admin"
    getPostHog()?.capture({
      distinctId: adminId,
      event: "order sent to ascolour",
      properties: {
        order_id: order.id,
        ascolour_order_id: ascolourOrder.id,
        ascolour_status: ascolourOrder.status ?? "Pending",
        item_count: items.length,
        shipping_method: shippingMethod,
        reference,
      },
    })
    return res.json({
      ok: true,
      ascolour_order_id: ascolourOrder.id,
      ascolour_status: ascolourOrder.status ?? "Pending",
      payload,
    })
  } catch (err: any) {
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...meta,
        ascolour_last_error: String(err?.message ?? err),
      },
    })
    throw err
  }
}

async function loadOrderAndModule(req: MedusaRequest, orderId: string) {
  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  let ascolour: AsColourService
  try {
    ascolour = req.scope.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "AS Colour module not configured. Set ASCOLOUR_* env vars and restart."
    )
  }

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address"],
    })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order "${orderId}" was not found.`)
  }

  return { order, ascolour, orderModuleService }
}

async function buildOrderPreview({
  order,
  ascolour,
}: {
  order: any
  ascolour: AsColourService
}) {
  try {
    const items = await buildItems(order, ascolour)
    return {
      items,
      shippingAddress: ascolour.getOptions().workshop_address,
      defaultShippingMethod: ascolour.getOptions().default_shipping_method ?? null,
    }
  } catch (err: any) {
    return { error: String(err?.message ?? err) }
  }
}

async function buildItems(
  order: any,
  ascolour: AsColourService
): Promise<AsColourCreateOrderItem[]> {
  const lineItems: any[] = order.items ?? []
  if (!lineItems.length) return []

  // Inventory lookup per SKU to determine which warehouse to ask for.
  const skus = lineItems
    .map((li) => li.variant_sku ?? li.metadata?.ascolour?.sku)
    .filter((s): s is string => Boolean(s))

  const skuToInventory = new Map<string, any>()
  for (const sku of new Set(skus)) {
    try {
      const inv = await ascolour.getClient().getInventoryItem(sku)
      skuToInventory.set(sku, inv)
    } catch {
      // Skip — caller may still pass overrideItems with explicit warehouse.
    }
  }

  const items: AsColourCreateOrderItem[] = []
  for (const li of lineItems) {
    const sku: string | undefined = li.variant_sku ?? li.metadata?.ascolour?.sku
    if (!sku) continue
    const meta = li.metadata ?? {}
    const isAsColour =
      meta?.ascolour ||
      meta?.source === "ascolour" ||
      (typeof sku === "string" && /^\d{3,5}-/.test(sku))
    if (!isAsColour) continue

    const inv = skuToInventory.get(sku)
    const warehouse = ascolour.pickWarehouseForSku(inv)
    if (!warehouse) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Could not resolve an AS Colour warehouse for SKU ${sku}. Pass overrideItems with explicit warehouse codes.`
      )
    }

    const quantity = Number(li.quantity ?? 0)
    if (!Number.isFinite(quantity) || quantity <= 0) continue

    items.push({ sku, warehouse, quantity })
  }
  return items
}
