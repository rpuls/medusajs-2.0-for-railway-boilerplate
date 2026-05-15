/**
 * Computes a customer-facing delivery ETA range from the current
 * production queue depth. Used on the PDP so customers see realistic
 * timing *before* they checkout instead of finding out after.
 *
 * Pure — takes a count-per-stage map and a config, returns the range.
 * The container-aware wrapper (`get-eta.ts`) queries the database.
 *
 * Algorithm:
 *   1. For each downstream stage, multiply the count of orders
 *      currently in that stage by an estimated days-per-order
 *      (capacity-normalised). Sum.
 *   2. Add baseline days for the new order's own journey through every
 *      stage at zero queue (the "floor").
 *   3. Apply a queue-depth multiplier — large backlogs slow down
 *      throughput non-linearly because the shop is bottlenecked.
 *   4. Return [floor, floor + estimated_queue_days] rounded to whole
 *      business days, with a small minimum spread so we don't quote
 *      an exact day.
 *
 * Everything is configurable via `ProductionEtaConfig` so staff can
 * tune as they learn their real throughput.
 */

export type DownstreamStageKey =
  | "received"
  | "art_review"
  | "awaiting_approval"
  | "approved"
  | "blanks_ordered"
  | "blanks_arrived"
  | "in_production"
  | "quality_check"

export type StageCounts = Partial<Record<DownstreamStageKey, number>>

export type ProductionEtaConfig = {
  /** Days an order spends in each stage when there's NO queue (sets
   *  the floor of the ETA window). */
  baseline_days_per_stage: Record<DownstreamStageKey, number>
  /** How many orders per day the shop can move through each stage at
   *  normal capacity. Larger queues stretch the ETA further. */
  daily_throughput_per_stage: Record<DownstreamStageKey, number>
  /** Multiplier applied to estimated queue days when the queue is
   *  >2x daily throughput — represents the non-linear slowdown when
   *  the shop is jammed. */
  congestion_multiplier: number
  /** Minimum gap (days) between low and high estimate so we don't
   *  give a single-day quote. */
  minimum_range_days: number
  /** Hard floor (days). Even at zero queue we won't quote faster than
   *  this — guards against unrealistic best cases. */
  minimum_eta_days: number
}

export const DEFAULT_PRODUCTION_ETA_CONFIG: ProductionEtaConfig = {
  baseline_days_per_stage: {
    received: 1,
    art_review: 2,
    awaiting_approval: 2,
    approved: 1,
    blanks_ordered: 4,
    blanks_arrived: 1,
    in_production: 2,
    quality_check: 1,
  },
  daily_throughput_per_stage: {
    received: 20,
    art_review: 10,
    awaiting_approval: 999, // bounded by customer, not us
    approved: 20,
    blanks_ordered: 999, // bounded by supplier
    blanks_arrived: 20,
    in_production: 8,
    quality_check: 15,
  },
  congestion_multiplier: 1.4,
  minimum_range_days: 2,
  minimum_eta_days: 4,
}

export type EtaResult = {
  low_days: number
  high_days: number
  /** Sum of baseline days. */
  baseline_days: number
  /** Estimated queue-induced extra days. */
  queue_days: number
  /** Stages with materially-elevated queues (>= 1.5x daily throughput). */
  congested_stages: DownstreamStageKey[]
}

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

export function computeProductionEta(
  counts: StageCounts,
  config: ProductionEtaConfig = DEFAULT_PRODUCTION_ETA_CONFIG
): EtaResult {
  const baselineDays = STAGE_KEYS.reduce(
    (acc, stage) => acc + (config.baseline_days_per_stage[stage] ?? 0),
    0
  )

  let queueDays = 0
  const congestedStages: DownstreamStageKey[] = []
  for (const stage of STAGE_KEYS) {
    const count = counts[stage] ?? 0
    const throughput = config.daily_throughput_per_stage[stage] ?? 1
    if (throughput <= 0) continue
    const stageQueueDays = count / throughput
    queueDays += stageQueueDays
    if (count >= throughput * 1.5) congestedStages.push(stage)
  }

  // Non-linear slowdown when the overall pipeline is jammed.
  if (queueDays > 5) {
    queueDays *= config.congestion_multiplier
  }

  const low = Math.max(config.minimum_eta_days, Math.ceil(baselineDays))
  let high = Math.max(low + config.minimum_range_days, Math.ceil(baselineDays + queueDays))
  if (high - low < config.minimum_range_days) {
    high = low + config.minimum_range_days
  }

  return {
    low_days: low,
    high_days: high,
    baseline_days: Math.ceil(baselineDays),
    queue_days: Math.ceil(queueDays),
    congested_stages: congestedStages,
  }
}
