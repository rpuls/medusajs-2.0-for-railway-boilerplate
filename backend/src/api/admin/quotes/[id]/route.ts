import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { QUOTE_MODULE } from "../../../../modules/quote"
import type QuoteModuleService from "../../../../modules/quote/service"

const VALID_STATUSES = ["new", "quoted", "accepted", "lost", "expired"] as const
type QuoteStatus = (typeof VALID_STATUSES)[number]

const updateSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  assigned_to: z.string().max(120).nullable().optional(),
  subject: z.string().max(200).nullable().optional(),
  contact_name: z.string().max(120).nullable().optional(),
  contact_phone: z.string().max(40).nullable().optional(),
  company: z.string().max(120).nullable().optional(),
  message: z.string().max(8000).optional(),
  currency_code: z.string().max(8).optional(),
  total_estimate: z.coerce.number().nullable().optional(),
  line_items: z
    .array(
      z.object({
        title: z.string().max(200),
        description: z.string().max(500).nullable().optional(),
        quantity: z.coerce.number().int().min(0).nullable().optional(),
        unit_price: z.coerce.number().nullable().optional(),
        total: z.coerce.number().nullable().optional(),
      })
    )
    .max(50)
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

const STATUS_TIMESTAMP: Partial<Record<QuoteStatus, string>> = {
  quoted: "quoted_at",
  accepted: "accepted_at",
  lost: "lost_at",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const quoteService = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  let quote: any
  try {
    quote = await quoteService.retrieveQuote(id)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Quote not found")
  }
  const events = await quoteService.listQuoteEvents(
    { quote_id: id },
    { order: { created_at: "DESC" }, take: 200 }
  )
  return res.json({ quote, events })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const body = updateSchema.parse(req.body ?? {})

  const quoteService = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  let current: any
  try {
    current = await quoteService.retrieveQuote(id)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Quote not found")
  }

  const actor = (req as any).auth_context?.actor_id ?? null
  type EventType =
    | "created"
    | "status_changed"
    | "assigned"
    | "message"
    | "note"
    | "line_items_updated"
  const events: Array<{ type: EventType; body: Record<string, unknown> }> = []
  const updatePayload: Record<string, unknown> = { id }

  if (body.status && body.status !== current.status) {
    updatePayload.status = body.status
    const ts = STATUS_TIMESTAMP[body.status]
    if (ts) updatePayload[ts] = new Date()
    events.push({
      type: "status_changed",
      body: { from: current.status, to: body.status },
    })
  }
  if (body.assigned_to !== undefined && body.assigned_to !== current.assigned_to) {
    updatePayload.assigned_to = body.assigned_to
    events.push({
      type: "assigned",
      body: { from: current.assigned_to, to: body.assigned_to },
    })
  }
  const directFields = [
    "subject",
    "contact_name",
    "contact_phone",
    "company",
    "message",
    "currency_code",
    "total_estimate",
    "metadata",
  ] as const
  for (const field of directFields) {
    if (body[field] !== undefined && body[field] !== current[field]) {
      ;(updatePayload as any)[field] = body[field]
    }
  }
  if (body.expires_at !== undefined) {
    updatePayload.expires_at = body.expires_at ? new Date(body.expires_at) : null
  }
  if (body.line_items !== undefined) {
    updatePayload.line_items = { items: body.line_items }
    events.push({ type: "line_items_updated", body: { count: body.line_items.length } })
  }

  if (Object.keys(updatePayload).length > 1) {
    await quoteService.updateQuotes([updatePayload])
  }

  if (events.length > 0) {
    await quoteService.createQuoteEvents(
      events.map((e) => ({ quote_id: id, type: e.type, actor, body: e.body }))
    )
  }

  const updated = await quoteService.retrieveQuote(id)
  return res.json({ quote: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const quoteService = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  try {
    await quoteService.deleteQuotes([id])
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Quote not found")
  }
  return res.json({ ok: true })
}
