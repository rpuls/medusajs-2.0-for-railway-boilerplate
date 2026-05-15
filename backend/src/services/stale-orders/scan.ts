import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import {
  SLACK_PRODUCTION_WEBHOOK_URL,
  STALE_ORDER_THRESHOLD_DAYS,
} from "../../lib/constants"

const TERMINAL_STAGES = new Set(["shipped", "delivered"])

export type StaleOrderEntry = {
  order_id: string
  display_id: number | null
  stage: string
  days_in_stage: number
  email: string | null
  customer_id: string | null
}

export type ScanResult = {
  considered: number
  newly_stale: StaleOrderEntry[]
  cleared: number
}

/**
 * Walks every in-flight order (not delivered, not shipped, not
 * cancelled) and stamps `metadata.is_stale` based on whether the
 * current production_stage has advanced within
 * STALE_ORDER_THRESHOLD_DAYS. Newly-stale orders are returned so the
 * cron can post them to Slack.
 *
 * Idempotent — running twice in a row produces the same metadata.
 * Stale → fresh transitions clear the flag.
 */
export async function scanStaleOrders(
  container: MedusaContainer,
  options: { now?: Date; thresholdDays?: number } = {}
): Promise<ScanResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const now = options.now ?? new Date()
  const thresholdDays = options.thresholdDays ?? STALE_ORDER_THRESHOLD_DAYS
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const orderModuleService = container.resolve(Modules.ORDER) as any

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "customer_id", "status", "metadata"],
    pagination: { take: 5000, skip: 0 },
  })

  const newlyStale: StaleOrderEntry[] = []
  let considered = 0
  let cleared = 0

  for (const o of (orders as any[]) ?? []) {
    if ((o?.status ?? "").toLowerCase() === "canceled") continue
    const meta = (o?.metadata as Record<string, unknown> | undefined) ?? {}
    const stage = typeof meta.production_stage === "string" ? meta.production_stage : null
    if (!stage || TERMINAL_STAGES.has(stage)) continue
    considered += 1

    const changedAtRaw =
      typeof meta.production_stage_changed_at === "string"
        ? meta.production_stage_changed_at
        : null
    const changedMs = changedAtRaw ? Date.parse(changedAtRaw) : NaN
    if (!Number.isFinite(changedMs)) {
      continue
    }
    const ageMs = now.getTime() - changedMs
    const wasMarkedStale = meta.is_stale === true
    const isStaleNow = ageMs >= thresholdMs

    if (isStaleNow && !wasMarkedStale) {
      try {
        await orderModuleService.updateOrders(o.id, {
          metadata: {
            ...meta,
            is_stale: true,
            stale_since: now.toISOString(),
          },
        })
        newlyStale.push({
          order_id: o.id as string,
          display_id: typeof o.display_id === "number" ? o.display_id : null,
          stage,
          days_in_stage: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
          email: typeof o.email === "string" ? o.email : null,
          customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        })
      } catch (err: any) {
        logger.warn(
          `stale-orders: failed to stamp ${o.id}: ${err?.message ?? err}`
        )
      }
    } else if (!isStaleNow && wasMarkedStale) {
      try {
        const cleanMeta = { ...meta }
        delete (cleanMeta as any).is_stale
        delete (cleanMeta as any).stale_since
        await orderModuleService.updateOrders(o.id, { metadata: cleanMeta })
        cleared += 1
      } catch {
        // best-effort
      }
    }
  }

  if (newlyStale.length > 0 && SLACK_PRODUCTION_WEBHOOK_URL) {
    await postSlackDigest(newlyStale, thresholdDays).catch((err) =>
      logger.warn(`stale-orders: Slack post failed: ${err?.message ?? err}`)
    )
  }

  return { considered, newly_stale: newlyStale, cleared }
}

async function postSlackDigest(
  entries: StaleOrderEntry[],
  thresholdDays: number
): Promise<void> {
  const url = SLACK_PRODUCTION_WEBHOOK_URL
  if (!url) return
  const lines = entries
    .map(
      (e) =>
        `• #${e.display_id ?? e.order_id.slice(-8)} — ${e.stage} for ${e.days_in_stage}d` +
        (e.email ? ` (${e.email})` : "")
    )
    .join("\n")
  const text = `*${entries.length} order${entries.length === 1 ? "" : "s"} stale* (no stage change in ${thresholdDays}+ days)\n${lines}`
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    throw err
  }
}
