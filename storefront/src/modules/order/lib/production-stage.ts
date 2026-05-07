/**
 * SYNC SOURCE: backend/src/lib/production-stage.ts
 *
 * Storefront mirror of the backend's canonical stage list. Two files exist
 * because backend and storefront are separate packages with separate node_modules
 * and tsconfigs — they can't share a single import.
 *
 * `scripts/check-production-stage-sync.mjs` validates that the data values
 * (PRODUCTION_STAGES, labels, milestones, email triggers) match the backend's
 * version. Run it after editing either file. Wire into CI to catch drift.
 *
 * The storefront file may carry storefront-only helpers (e.g. `milestoneIndex`,
 * `readProductionStageMetadata`) that the backend doesn't need; the sync check
 * ignores those.
 */

export const PRODUCTION_STAGES = [
  "received",
  "art_review",
  "awaiting_approval",
  "approved",
  "blanks_ordered",
  "blanks_arrived",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
] as const

export type ProductionStage = (typeof PRODUCTION_STAGES)[number]

export const PRODUCTION_STAGE_LABEL: Record<ProductionStage, string> = {
  received: "Order received",
  art_review: "Artwork review",
  awaiting_approval: "Awaiting your approval",
  approved: "Artwork approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
}

export type CustomerMilestone =
  | "received"
  | "artwork"
  | "production"
  | "shipped"
  | "delivered"

export const CUSTOMER_MILESTONES: CustomerMilestone[] = [
  "received",
  "artwork",
  "production",
  "shipped",
  "delivered",
]

export const CUSTOMER_MILESTONE_LABEL: Record<CustomerMilestone, string> = {
  received: "Order received",
  artwork: "Artwork & approval",
  production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
}

export function customerMilestoneForStage(stage: ProductionStage): CustomerMilestone {
  switch (stage) {
    case "received":
      return "received"
    case "art_review":
    case "awaiting_approval":
    case "approved":
      return "artwork"
    case "blanks_ordered":
    case "blanks_arrived":
    case "in_production":
    case "quality_check":
      return "production"
    case "shipped":
      return "shipped"
    case "delivered":
      return "delivered"
  }
}

export function milestoneIndex(milestone: CustomerMilestone): number {
  return CUSTOMER_MILESTONES.indexOf(milestone)
}

export function isProductionStage(value: unknown): value is ProductionStage {
  return typeof value === "string" && (PRODUCTION_STAGES as readonly string[]).includes(value)
}

export type ProductionStageHistoryEntry = {
  stage: ProductionStage
  changed_at: string
  changed_by?: string | null
  note?: string | null
}

export type OrderProductionStageMetadata = {
  production_stage?: ProductionStage
  production_stage_changed_at?: string
  production_stage_history?: ProductionStageHistoryEntry[]
}

export function readProductionStageMetadata(
  metadata: Record<string, unknown> | null | undefined
): {
  stage: ProductionStage | null
  changedAt: string | null
  history: ProductionStageHistoryEntry[]
} {
  if (!metadata || typeof metadata !== "object") {
    return { stage: null, changedAt: null, history: [] }
  }

  const stageRaw = (metadata as OrderProductionStageMetadata).production_stage
  const stage = isProductionStage(stageRaw) ? stageRaw : null

  const changedAtRaw = (metadata as OrderProductionStageMetadata).production_stage_changed_at
  const changedAt = typeof changedAtRaw === "string" ? changedAtRaw : null

  const historyRaw = (metadata as OrderProductionStageMetadata).production_stage_history
  const history = Array.isArray(historyRaw)
    ? historyRaw.filter((entry): entry is ProductionStageHistoryEntry => {
        if (!entry || typeof entry !== "object") return false
        const s = (entry as { stage?: unknown }).stage
        const c = (entry as { changed_at?: unknown }).changed_at
        return isProductionStage(s) && typeof c === "string"
      })
    : []

  return { stage, changedAt, history }
}
