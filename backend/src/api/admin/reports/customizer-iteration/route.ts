import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import {
  getServiceAccountKey,
  isSeoConfigured,
} from "../../../../services/seo-analytics/google-auth"
import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/customizer-iteration
 *
 * How much fiddling does a typical customizer session take? GA4 fires a
 * throttled `customizer_action_taken` event for every Fabric.js
 * mutation. We aggregate per session: actions per session, and ratio
 * of action volume to design_started → design_added_to_cart conversion.
 *
 * Pairs with the existing customizer-funnel report — funnel says
 * "where did people drop off"; this says "of those who started a
 * design, how much effort did they put in before dropping off vs
 * checking out".
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  const configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)
  if (!configured) {
    return res.json({
      configured: false,
      from: from.toISOString(),
      to: to.toISOString(),
      summary: null,
    })
  }

  try {
    const key = getServiceAccountKey()
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: key.client_email,
        private_key: key.private_key,
      },
    })
    const property = `properties/${GA4_PROPERTY_ID}`
    const dateRanges = [
      {
        startDate: from.toISOString().slice(0, 10),
        endDate: to.toISOString().slice(0, 10),
      },
    ]

    const [byEvent, sessionsRes] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [
          { name: "eventCount" },
          { name: "totalUsers" },
          { name: "sessions" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "customizer_action_taken",
                "customizer_design_started",
                "customizer_design_saved",
                "customizer_design_added_to_cart",
              ],
            },
          },
        },
        limit: 10,
      }),
      // Per-day actions for sparkline trend
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: {
              matchType: "EXACT",
              value: "customizer_action_taken",
            },
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 365,
      }),
    ])

    const counts = new Map<string, { events: number; users: number; sessions: number }>()
    for (const r of byEvent[0]?.rows ?? []) {
      const name = r.dimensionValues?.[0]?.value ?? ""
      counts.set(name, {
        events: Number(r.metricValues?.[0]?.value ?? 0),
        users: Number(r.metricValues?.[1]?.value ?? 0),
        sessions: Number(r.metricValues?.[2]?.value ?? 0),
      })
    }
    const actionEvents = counts.get("customizer_action_taken")?.events ?? 0
    const actionSessions =
      counts.get("customizer_action_taken")?.sessions ?? 0
    const startedSessions =
      counts.get("customizer_design_started")?.sessions ?? 0
    const cartedSessions =
      counts.get("customizer_design_added_to_cart")?.sessions ?? 0
    const savedSessions =
      counts.get("customizer_design_saved")?.sessions ?? 0

    // Daily action trend
    const trend = (sessionsRes[0]?.rows ?? []).map((r) => {
      const raw = r.dimensionValues?.[0]?.value ?? ""
      // GA4 returns YYYYMMDD
      const iso =
        raw.length === 8
          ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
          : raw
      return {
        date: iso,
        actions: Number(r.metricValues?.[0]?.value ?? 0),
      }
    })

    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        action_events: actionEvents,
        action_sessions: actionSessions,
        started_sessions: startedSessions,
        carted_sessions: cartedSessions,
        saved_sessions: savedSessions,
        avg_actions_per_session:
          actionSessions > 0
            ? Math.round((actionEvents / actionSessions) * 10) / 10
            : 0,
        // Conversion-weighted: action volume / cart conversions tells
        // you "how much effort per actual sale". High = friction.
        actions_per_cart_add:
          cartedSessions > 0
            ? Math.round((actionEvents / cartedSessions) * 10) / 10
            : 0,
        cart_rate_pct:
          startedSessions > 0
            ? Math.round((cartedSessions / startedSessions) * 1000) / 10
            : 0,
      },
      trend,
    })
  } catch (err: any) {
    logger.error?.(
      `[customizer-iteration] GA4 query failed: ${err?.message ?? err}`
    )
    return res.status(502).json({
      configured: true,
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }
}
