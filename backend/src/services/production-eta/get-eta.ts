import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  computeProductionEta,
  DEFAULT_PRODUCTION_ETA_CONFIG,
  type DownstreamStageKey,
  type EtaResult,
  type StageCounts,
} from "./compute-eta"

const STAGE_KEYS: DownstreamStageKey[] = [
  "received",
  "art_review",
  "awaiting_approval",
  "approved",
  "blanks_ordered",
  "blanks_arrived",
  "in_production",
  "quality_check",
]

/**
 * Reads every order whose `metadata.production_stage` matches one of
 * the downstream stages (i.e. still in-flight), buckets them, and
 * applies `computeProductionEta`. Live read each call — small data
 * volume (orders currently in flight). Cache at the route layer if it
 * ever matters.
 */
export async function getProductionEta(
  container: MedusaContainer
): Promise<EtaResult> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata", "status"],
    pagination: { take: 5000, skip: 0 },
  })

  const counts: StageCounts = {}
  for (const order of (orders as any[]) ?? []) {
    if ((order?.status ?? "").toLowerCase() === "canceled") continue
    const meta = (order?.metadata as Record<string, unknown> | undefined) ?? {}
    const stage = meta.production_stage
    if (typeof stage !== "string") continue
    if (!STAGE_KEYS.includes(stage as DownstreamStageKey)) continue
    const key = stage as DownstreamStageKey
    counts[key] = (counts[key] ?? 0) + 1
  }

  return computeProductionEta(counts, DEFAULT_PRODUCTION_ETA_CONFIG)
}
