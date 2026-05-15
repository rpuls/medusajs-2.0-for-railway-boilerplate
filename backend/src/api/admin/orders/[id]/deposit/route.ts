import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const schema = z.object({
  deposit_amount_cents: z.coerce.number().int().min(0).optional(),
  deposit_paid: z.boolean().optional(),
  deposit_paid_at: z.string().datetime().optional(),
  balance_due_at: z.string().datetime().nullable().optional(),
  notes: z.string().max(500).optional(),
})

/**
 * GET / POST /admin/orders/:id/deposit
 *
 * Lightweight deposit tracking — staff record the amount the customer
 * has paid upfront against an order, plus when the balance is due.
 * No payment-provider integration; the actual money movement happens
 * via the existing Stripe / manual capture flow. This endpoint only
 * stamps the *bookkeeping* state onto `order.metadata.deposit_*` so
 * staff have a single source of truth.
 *
 * Stored shape:
 *   order.metadata.deposit_amount_cents: number
 *   order.metadata.deposit_paid: boolean
 *   order.metadata.deposit_paid_at: ISO
 *   order.metadata.balance_due_at: ISO | null
 *   order.metadata.deposit_notes: string | null
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  res.json({
    deposit_amount_cents:
      typeof meta.deposit_amount_cents === "number"
        ? meta.deposit_amount_cents
        : 0,
    deposit_paid: meta.deposit_paid === true,
    deposit_paid_at:
      typeof meta.deposit_paid_at === "string" ? meta.deposit_paid_at : null,
    balance_due_at:
      typeof meta.balance_due_at === "string" ? meta.balance_due_at : null,
    notes: typeof meta.deposit_notes === "string" ? meta.deposit_notes : null,
    order_total: order.total,
    currency_code: order.currency_code,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const updates: Record<string, unknown> = { ...meta }
  if (body.deposit_amount_cents !== undefined) {
    updates.deposit_amount_cents = body.deposit_amount_cents
  }
  if (body.deposit_paid !== undefined) {
    updates.deposit_paid = body.deposit_paid
    if (body.deposit_paid && !meta.deposit_paid_at) {
      updates.deposit_paid_at = new Date().toISOString()
    }
    if (!body.deposit_paid) {
      updates.deposit_paid_at = null
    }
  }
  if (body.deposit_paid_at !== undefined) {
    updates.deposit_paid_at = body.deposit_paid_at
  }
  if (body.balance_due_at !== undefined) {
    updates.balance_due_at = body.balance_due_at
  }
  if (body.notes !== undefined) {
    updates.deposit_notes = body.notes
  }
  await orderModuleService.updateOrders(orderId, { metadata: updates })
  res.json({ ok: true })
}
