import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { QUOTE_MODULE } from "../../../modules/quote"
import type QuoteModuleService from "../../../modules/quote/service"

/**
 * GET /admin/quotes?status=new,quoted&assigned_to=...&q=...
 *   → { quotes, count }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const status = (req.query.status as string | undefined)?.split(",").map((s) => s.trim()).filter(Boolean)
  const assignedTo = (req.query.assigned_to as string | undefined)?.trim()
  const q = (req.query.q as string | undefined)?.trim()
  const limit = Math.max(1, Math.min(200, Number.parseInt((req.query.limit as string) ?? "50", 10) || 50))
  const offset = Math.max(0, Number.parseInt((req.query.offset as string) ?? "0", 10) || 0)

  const filters: Record<string, unknown> = {}
  if (status?.length) filters.status = status
  if (assignedTo) filters.assigned_to = assignedTo

  const quoteService = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)

  let quotes: any[]
  let count: number
  if (q) {
    const [all, total] = await quoteService.listAndCountQuotes(filters, {
      take: 500,
      skip: 0,
      order: { created_at: "DESC" },
    })
    const term = q.toLowerCase()
    const matched = (all as any[]).filter((quote) => {
      const haystack = [
        quote.email,
        quote.public_id,
        quote.subject,
        quote.company,
        quote.contact_name,
      ]
        .filter((v): v is string => typeof v === "string")
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
    quotes = matched.slice(offset, offset + limit)
    count = matched.length
  } else {
    const [list, total] = await quoteService.listAndCountQuotes(filters, {
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
    })
    quotes = list as any[]
    count = total as number
  }

  return res.json({ quotes, count, limit, offset })
}
