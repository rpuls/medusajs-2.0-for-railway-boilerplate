import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { SEARCH_LOG_MODULE } from "../../../modules/search-log"

/**
 * POST /store/search-events
 *
 * Storefront-facing logger for internal site searches. Body:
 *   {
 *     "query": "raw user input",
 *     "results_count": 42,
 *     "country_code": "au",
 *     "customer_id": "cus_..."  (optional; populated server-side from
 *                                 auth in the future)
 *   }
 *
 * Returns 204 always so a logging failure never breaks search UX. Drops
 * empty queries and queries longer than 500 chars defensively.
 */

const bodySchema = z.object({
  query: z.string().trim().min(1).max(500),
  results_count: z.number().int().nonnegative(),
  country_code: z.string().trim().max(8).optional(),
  customer_id: z.string().trim().max(64).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = bodySchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    // Don't leak validation detail to anonymous storefront callers.
    res.status(204).end()
    return
  }

  const logger = (req.scope as any).resolve?.("logger") ?? console
  try {
    const service = req.scope.resolve(SEARCH_LOG_MODULE) as any
    const queryNormalized = parsed.data.query.trim().toLowerCase()
    await service.createSearchEvents([
      {
        query: parsed.data.query.trim(),
        query_normalized: queryNormalized,
        results_count: parsed.data.results_count,
        country_code: parsed.data.country_code ?? null,
        customer_id: parsed.data.customer_id ?? null,
      },
    ])
  } catch (err: any) {
    logger.warn?.(`[search-events] log failed: ${err?.message ?? err}`)
  }
  res.status(204).end()
}
