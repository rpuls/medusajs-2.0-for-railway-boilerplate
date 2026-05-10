import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { fetchPostHogStats } from "../../../../services/posthog-stats"

/**
 * GET /admin/reports/posthog-stats
 *
 * Returns last-7-day PostHog signals (pageviews, sessions, top path) for the
 * Reports page operational tile. Always 200s — failures surface inside the
 * payload's `error` field so the tile can render partial data + an error
 * note rather than the whole row going red.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const daysRaw = req.query.days
  const parsedDays =
    typeof daysRaw === "string" ? parseInt(daysRaw, 10) : NaN
  const days = Number.isFinite(parsedDays) && parsedDays > 0 && parsedDays <= 90
    ? parsedDays
    : 7

  const stats = await fetchPostHogStats(days)
  return res.json(stats)
}
