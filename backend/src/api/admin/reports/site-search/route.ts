import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/site-search?from=&to=
 *
 * Aggregates raw search events recorded by the storefront. Returns the
 * top 20 queries by search volume, the top 10 zero-result queries
 * (gold for merchandising — products customers want that you don't
 * surface), plus distinct-query and total-search KPIs.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let events: any[] = []
  try {
    const { data } = await query.graph({
      entity: "search_event",
      fields: ["id", "query", "query_normalized", "results_count", "created_at"],
      pagination: { take: 50000, skip: 0 },
    })
    events = (data as any[]) ?? []
  } catch (err: any) {
    // Module may not be registered yet (or migration not run). Surface
    // a soft error rather than 500.
    logger.warn?.(`[site-search] graph query failed: ${err?.message ?? err}`)
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        total_searches: 0,
        distinct_queries: 0,
        zero_result_searches: 0,
      },
      top_queries: [],
      top_zero_result_queries: [],
      module_available: false,
    })
  }

  const fromMs = from.getTime()
  const toMs = to.getTime()

  type Bucket = {
    query: string
    count: number
    total_results: number
    zero_result_count: number
  }
  const byKey = new Map<string, Bucket>()
  let totalSearches = 0
  let zeroResultSearches = 0

  for (const ev of events) {
    const ms = Date.parse(ev?.created_at ?? "")
    if (!Number.isFinite(ms)) continue
    if (ms < fromMs || ms > toMs) continue
    totalSearches += 1
    const key = (ev.query_normalized as string) || (ev.query as string) || ""
    if (!key) continue
    const existing = byKey.get(key)
    const isZero = Number(ev.results_count ?? 0) === 0
    if (isZero) zeroResultSearches += 1
    if (existing) {
      existing.count += 1
      existing.total_results += Number(ev.results_count ?? 0)
      if (isZero) existing.zero_result_count += 1
    } else {
      byKey.set(key, {
        query: ev.query ?? key,
        count: 1,
        total_results: Number(ev.results_count ?? 0),
        zero_result_count: isZero ? 1 : 0,
      })
    }
  }

  const all = Array.from(byKey.values())
  const topQueries = [...all].sort((a, b) => b.count - a.count).slice(0, 20)
  // Zero-result queries: ranked by frequency among queries that ALWAYS
  // returned zero results in the window. (Mixed queries — sometimes
  // zero, sometimes not — are noisy here.)
  const topZeroResult = all
    .filter((b) => b.zero_result_count === b.count && b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_searches: totalSearches,
      distinct_queries: byKey.size,
      zero_result_searches: zeroResultSearches,
      zero_result_share:
        totalSearches > 0
          ? Math.round((zeroResultSearches / totalSearches) * 1000) / 1000
          : 0,
    },
    top_queries: topQueries.map((b) => ({
      query: b.query,
      count: b.count,
      avg_results:
        b.count > 0 ? Math.round((b.total_results / b.count) * 10) / 10 : 0,
    })),
    top_zero_result_queries: topZeroResult.map((b) => ({
      query: b.query,
      count: b.count,
    })),
    module_available: true,
  })
}
