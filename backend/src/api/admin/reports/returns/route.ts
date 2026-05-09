import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/returns
 *
 * STUB. The Medusa returns module isn't enabled in this codebase and the
 * storefront has no RMA flow. Until both are in place, this route
 * returns the empty-state shape so the chart card can render cleanly.
 *
 * When you wire RMA:
 *   1. Enable Medusa's `Return` entity (it ships in core)
 *   2. Add a storefront return-request UI under /account/orders/details
 *   3. Replace the stub below with a `query.graph({ entity: "return", ... })`
 *      call that joins returns to their original orders + reason codes.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  parseRegionFilter(req.query as Record<string, unknown>)

  // Probe the returns entity. If it isn't registered or the schema
  // doesn't exist, fall through to the empty-state response.
  let returnCount = 0
  try {
    const { data } = await query.graph({
      entity: "return",
      fields: ["id", "status"],
      pagination: { take: 1, skip: 0 },
    })
    returnCount = (data as any[])?.length ?? 0
  } catch (err: any) {
    logger.info?.(
      `[returns] returns module not active (${err?.message ?? err})`
    )
  }

  if (returnCount === 0) {
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      by_variant: [],
      by_reason: [],
      summary: {
        total_returns: 0,
        return_rate: 0,
      },
      status: "no_data",
      reason: "rma_not_enabled",
    })
  }

  // Hook for the future aggregation. Today this branch is unreachable
  // since the probe returns 0 — but the shape is here so the frontend
  // doesn't have to change when RMA goes live.
  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    by_variant: [],
    by_reason: [],
    summary: { total_returns: 0, return_rate: 0 },
    status: "ok",
  })
}
