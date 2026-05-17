import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { AUSSIEPACIFIC_MODULE } from "../../../../../modules/aussiepacific"
import AussiePacificService from "../../../../../modules/aussiepacific/service"
import type { AussiePacificCreateOrderRequest } from "../../../../../modules/aussiepacific/types"
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
} from "../../../../../lib/constants"
import { getPostHog } from "../../../../../lib/posthog"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z
  .object({
    shippingMethod: z.string().min(1).optional(),
    deliveryNotes: z.string().max(1000).optional(),
    overrideItems: z
      .array(
        z.object({
          sku: z.string(),
          quantity: z.number().int().positive(),
        })
      )
      .optional(),
  })
  .partial()

type AussiePacificLineItem = {
  sku: string
  quantity: number
}

/**
 * GET /admin/orders/:id/send-to-aussie-pacific
 *
 * Returns the AP order metadata already recorded against the Medusa order
 * plus a preview of the line items that would be forwarded.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }

  const { order, ap } = await loadOrderAndModule(req, params.data.id)
  const meta = (order.metadata ?? {}) as Record<string, any>
  const preview = buildOrderPreview({ order, ap })

  return res.json({
    sent: Boolean(meta.aussiepacific_order_id),
    aussiepacific_order_id: meta.aussiepacific_order_id ?? null,
    aussiepacific_status: meta.aussiepacific_status ?? null,
    aussiepacific_sent_at: meta.aussiepacific_sent_at ?? null,
    aussiepacific_po_number: meta.aussiepacific_po_number ?? null,
    aussiepacific_shipments: Array.isArray(meta.aussiepacific_shipments)
      ? meta.aussiepacific_shipments
      : [],
    aussiepacific_last_synced_at: meta.aussiepacific_last_synced_at ?? null,
    last_sync_error: meta.aussiepacific_last_sync_error ?? null,
    last_error: meta.aussiepacific_last_error ?? null,
    preview,
  })
}

/**
 * POST /admin/orders/:id/send-to-aussie-pacific
 *
 * Forwards AP-line items to AP's `POST /api/v1/order`. Records the AP order
 * reference + status on `order.metadata`. Idempotent: refuses to send twice.
 *
 * AP exposes no status-polling endpoint, so once sent we rely on AP's email
 * confirmations and the distributor portal for shipment updates.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const body = bodySchema.parse(req.body ?? {})

  const { order, ap, orderModuleService } = await loadOrderAndModule(
    req,
    params.data.id
  )
  const meta = (order.metadata ?? {}) as Record<string, any>

  if (meta.aussiepacific_order_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Order already sent to Aussie Pacific as ${meta.aussiepacific_order_id}.`
    )
  }

  const opts = ap.getOptions()
  const items: AussiePacificLineItem[] =
    body.overrideItems ?? buildItems(order)

  if (!items.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No Aussie Pacific line items found on this order."
    )
  }

  const shippingMethod = body.shippingMethod ?? opts.default_shipping_method
  const workshopAddress = requireWorkshopAddress()
  const poNumber = String((order as any).display_id ?? order.id)

  const payload: AussiePacificCreateOrderRequest = {
    po_number: poNumber,
    contact: {
      name:
        [ASCOLOUR_WORKSHOP_FIRST_NAME, ASCOLOUR_WORKSHOP_LAST_NAME]
          .filter(Boolean)
          .join(" ") || ASCOLOUR_WORKSHOP_COMPANY || "SC Prints",
      phone: ASCOLOUR_WORKSHOP_PHONE ?? "",
      email: ASCOLOUR_WORKSHOP_EMAIL,
    },
    address: workshopAddress,
    lines: items.map((it) => ({ item_code: it.sku, quantity: it.quantity })),
    ...(shippingMethod ? { shipping_method: shippingMethod } : {}),
    ...(body.deliveryNotes ? { delivery_notes: body.deliveryNotes } : {}),
  }

  try {
    const apOrder = await ap.createDropshipOrder(payload)
    const apOrderId =
      apOrder?.id ?? apOrder?.reference ?? `AP-${poNumber}`
    const apStatus = apOrder?.status ?? "Submitted"

    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...meta,
        aussiepacific_order_id: apOrderId,
        aussiepacific_status: apStatus,
        aussiepacific_sent_at: new Date().toISOString(),
        aussiepacific_po_number: poNumber,
        aussiepacific_last_error: null,
      },
    })
    const adminId =
      (req as any).auth_context?.actor_id ??
      (req as any).auth_context?.app_metadata?.user_id ??
      "admin"
    getPostHog()?.capture({
      distinctId: adminId,
      event: "order sent to aussie pacific",
      properties: {
        order_id: order.id,
        aussiepacific_order_id: apOrderId,
        aussiepacific_status: apStatus,
        item_count: items.length,
        shipping_method: shippingMethod ?? null,
        po_number: poNumber,
      },
    })
    return res.json({
      ok: true,
      aussiepacific_order_id: apOrderId,
      aussiepacific_status: apStatus,
      payload,
    })
  } catch (err: any) {
    await orderModuleService.updateOrders(order.id, {
      metadata: {
        ...meta,
        aussiepacific_last_error: String(err?.message ?? err),
      },
    })
    throw err
  }
}

async function loadOrderAndModule(req: MedusaRequest, orderId: string) {
  const orderModuleService = req.scope.resolve<IOrderModuleService>(
    Modules.ORDER
  )
  let ap: AussiePacificService
  try {
    ap = req.scope.resolve(AUSSIEPACIFIC_MODULE) as AussiePacificService
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Aussie Pacific module not configured. Set AUSSIE_PACIFIC_API_TOKEN and restart."
    )
  }

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address"],
    })
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order "${orderId}" was not found.`
    )
  }

  return { order, ap, orderModuleService }
}

function buildOrderPreview({
  order,
  ap,
}: {
  order: any
  ap: AussiePacificService
}) {
  try {
    const items = buildItems(order)
    return {
      items,
      shippingAddress: tryReadWorkshopAddress(),
      defaultShippingMethod: ap.getOptions().default_shipping_method ?? null,
    }
  } catch (err: any) {
    return { error: String(err?.message ?? err) }
  }
}

/**
 * Identify AP line items on a Medusa order. Primary signal: variant
 * metadata.aussiepacific (set by the importer). Secondary signal: any
 * line whose metadata.source === "aussiepacific".
 *
 * No SKU-pattern regex fallback for now — AP's style codes (often 4
 * digits) overlap too much with other supplier SKUs to safely guess.
 */
function buildItems(order: any): AussiePacificLineItem[] {
  const lineItems: any[] = order.items ?? []
  if (!lineItems.length) return []

  const apLines = lineItems.filter((li) => {
    const meta = li.metadata ?? {}
    return Boolean(meta?.aussiepacific || meta?.source === "aussiepacific")
  })

  const items: AussiePacificLineItem[] = []
  for (const li of apLines) {
    const sku: string | undefined =
      li.metadata?.aussiepacific?.sku ?? li.variant_sku
    if (!sku) continue
    const quantity = Number(li.quantity ?? 0)
    if (!Number.isFinite(quantity) || quantity <= 0) continue
    items.push({ sku, quantity })
  }
  return items
}

function tryReadWorkshopAddress() {
  if (
    !ASCOLOUR_WORKSHOP_ADDRESS_1 ||
    !ASCOLOUR_WORKSHOP_CITY ||
    !ASCOLOUR_WORKSHOP_STATE ||
    !ASCOLOUR_WORKSHOP_ZIP
  ) {
    return undefined
  }
  return {
    company: ASCOLOUR_WORKSHOP_COMPANY || "SC Prints",
    address_1: ASCOLOUR_WORKSHOP_ADDRESS_1,
    address_2: ASCOLOUR_WORKSHOP_ADDRESS_2 || undefined,
    city: ASCOLOUR_WORKSHOP_CITY,
    state: ASCOLOUR_WORKSHOP_STATE,
    postcode: ASCOLOUR_WORKSHOP_ZIP,
    country: ASCOLOUR_WORKSHOP_COUNTRY_CODE || "AU",
  }
}

function requireWorkshopAddress() {
  const addr = tryReadWorkshopAddress()
  if (!addr) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Workshop address incomplete. Set ASCOLOUR_WORKSHOP_ADDRESS_1, _CITY, _STATE, _ZIP (reused for AP dropship)."
    )
  }
  return addr
}
