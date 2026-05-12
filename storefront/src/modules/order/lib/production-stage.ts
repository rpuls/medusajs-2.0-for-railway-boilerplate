/**
 * SYNC SOURCE: backend/src/lib/production-stage.ts
 *
 * Storefront mirror of the backend's canonical stage list. Two files exist
 * because backend and storefront are separate packages with separate
 * node_modules and tsconfigs — they can't share a single import.
 *
 * `scripts/check-production-stage-sync.mjs` validates parity. Run it after
 * editing either file. See the backend file for full design notes on the
 * three parallel tracks (artwork / blanks / production).
 *
 * The storefront file may carry storefront-only helpers (e.g.
 * `milestoneIndex`, `readProductionStageMetadata`) that the backend doesn't
 * need; the sync check ignores those.
 */

export const ARTWORK_STAGES = [
  "pending",
  "in_review",
  "awaiting_approval",
  "approved",
] as const

export type ArtworkStage = (typeof ARTWORK_STAGES)[number]

export const ARTWORK_STAGE_LABEL: Record<ArtworkStage, string> = {
  pending: "Artwork not started",
  in_review: "Artwork review",
  awaiting_approval: "Awaiting your approval",
  approved: "Artwork approved",
}

export const BLANKS_STAGES = [
  "not_started",
  "ordered",
  "arrived",
] as const

export type BlanksStage = (typeof BLANKS_STAGES)[number]

export const BLANKS_STAGE_LABEL: Record<BlanksStage, string> = {
  not_started: "Blanks not ordered",
  ordered: "Blanks ordered",
  arrived: "Blanks received",
}

export const DOWNSTREAM_STAGES = [
  "received",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
] as const

export type DownstreamStage = (typeof DOWNSTREAM_STAGES)[number]

export const DOWNSTREAM_STAGE_LABEL: Record<DownstreamStage, string> = {
  received: "Order received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
}

export const PRODUCTION_STAGES = [
  "received",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
  "pending",
  "in_review",
  "awaiting_approval",
  "approved",
  "not_started",
  "ordered",
  "arrived",
  "art_review",
  "blanks_ordered",
  "blanks_arrived",
] as const

export type ProductionStage = (typeof PRODUCTION_STAGES)[number]

export const PRODUCTION_STAGE_LABEL: Record<ProductionStage, string> = {
  received: "Order received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
  pending: "Artwork not started",
  in_review: "Artwork review",
  awaiting_approval: "Awaiting your approval",
  approved: "Artwork approved",
  not_started: "Blanks not ordered",
  ordered: "Blanks ordered",
  arrived: "Blanks received",
  art_review: "Artwork review",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
}

export type ProductionTrack = "artwork" | "blanks" | "production"

export type CustomerMilestone =
  | "received"
  | "preparing"
  | "production"
  | "shipped"
  | "delivered"

export const CUSTOMER_MILESTONES: CustomerMilestone[] = [
  "received",
  "preparing",
  "production",
  "shipped",
  "delivered",
]

export const CUSTOMER_MILESTONE_LABEL: Record<CustomerMilestone, string> = {
  received: "Order received",
  preparing: "Preparing your order",
  production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
}

export function customerMilestoneForStage(stage: ProductionStage): CustomerMilestone {
  switch (stage) {
    case "received":
      return "received"
    case "pending":
    case "in_review":
    case "awaiting_approval":
    case "approved":
    case "art_review":
      return "preparing"
    case "not_started":
    case "ordered":
    case "arrived":
    case "blanks_ordered":
    case "blanks_arrived":
      return "preparing"
    case "in_production":
    case "quality_check":
      return "production"
    case "shipped":
      return "shipped"
    case "delivered":
      return "delivered"
  }
}

export type DerivedTracks = {
  artwork_stage: ArtworkStage
  blanks_stage: BlanksStage
  production_stage: DownstreamStage
}

export function deriveTracksFromLegacyStage(stage: ProductionStage | null | undefined): DerivedTracks {
  switch (stage) {
    case "received":
    case null:
    case undefined:
      return { artwork_stage: "pending", blanks_stage: "not_started", production_stage: "received" }
    case "art_review":
    case "in_review":
      return { artwork_stage: "in_review", blanks_stage: "not_started", production_stage: "received" }
    case "awaiting_approval":
      return { artwork_stage: "awaiting_approval", blanks_stage: "not_started", production_stage: "received" }
    case "approved":
      return { artwork_stage: "approved", blanks_stage: "not_started", production_stage: "received" }
    case "blanks_ordered":
    case "ordered":
      return { artwork_stage: "approved", blanks_stage: "ordered", production_stage: "received" }
    case "blanks_arrived":
    case "arrived":
      return { artwork_stage: "approved", blanks_stage: "arrived", production_stage: "received" }
    case "in_production":
      return { artwork_stage: "approved", blanks_stage: "arrived", production_stage: "in_production" }
    case "quality_check":
      return { artwork_stage: "approved", blanks_stage: "arrived", production_stage: "quality_check" }
    case "shipped":
      return { artwork_stage: "approved", blanks_stage: "arrived", production_stage: "shipped" }
    case "delivered":
      return { artwork_stage: "approved", blanks_stage: "arrived", production_stage: "delivered" }
    case "pending":
      return { artwork_stage: "pending", blanks_stage: "not_started", production_stage: "received" }
    case "not_started":
      return { artwork_stage: "pending", blanks_stage: "not_started", production_stage: "received" }
  }
}

export function milestoneIndex(milestone: CustomerMilestone): number {
  return CUSTOMER_MILESTONES.indexOf(milestone)
}

export function isProductionStage(value: unknown): value is ProductionStage {
  return typeof value === "string" && (PRODUCTION_STAGES as readonly string[]).includes(value)
}

export function isArtworkStage(value: unknown): value is ArtworkStage {
  return typeof value === "string" && (ARTWORK_STAGES as readonly string[]).includes(value)
}

export function isBlanksStage(value: unknown): value is BlanksStage {
  return typeof value === "string" && (BLANKS_STAGES as readonly string[]).includes(value)
}

export function isDownstreamStage(value: unknown): value is DownstreamStage {
  return typeof value === "string" && (DOWNSTREAM_STAGES as readonly string[]).includes(value)
}

export type ProductionStageHistoryEntry = {
  stage: ProductionStage
  changed_at: string
  changed_by?: string | null
  note?: string | null
  track?: ProductionTrack
}

export type OrderProductionStageMetadata = {
  production_stage?: ProductionStage
  production_stage_changed_at?: string
  production_stage_history?: ProductionStageHistoryEntry[]
  artwork_stage?: ArtworkStage
  artwork_stage_changed_at?: string
  blanks_stage?: BlanksStage
  blanks_stage_changed_at?: string
}

/**
 * Reads the production-stage triple + the two track fields from order
 * metadata. If track fields are missing (legacy orders), derives them
 * from the unified `production_stage`.
 */
export function readProductionStageMetadata(
  metadata: Record<string, unknown> | null | undefined
): {
  stage: ProductionStage | null
  changedAt: string | null
  history: ProductionStageHistoryEntry[]
  artworkStage: ArtworkStage
  blanksStage: BlanksStage
  downstreamStage: DownstreamStage
} {
  if (!metadata || typeof metadata !== "object") {
    const derived = deriveTracksFromLegacyStage(null)
    return {
      stage: null,
      changedAt: null,
      history: [],
      artworkStage: derived.artwork_stage,
      blanksStage: derived.blanks_stage,
      downstreamStage: derived.production_stage,
    }
  }

  const m = metadata as OrderProductionStageMetadata
  const stageRaw = m.production_stage
  const stage = isProductionStage(stageRaw) ? stageRaw : null

  const changedAtRaw = m.production_stage_changed_at
  const changedAt = typeof changedAtRaw === "string" ? changedAtRaw : null

  const historyRaw = m.production_stage_history
  const history = Array.isArray(historyRaw)
    ? historyRaw.filter((entry): entry is ProductionStageHistoryEntry => {
        if (!entry || typeof entry !== "object") return false
        const s = (entry as { stage?: unknown }).stage
        const c = (entry as { changed_at?: unknown }).changed_at
        return isProductionStage(s) && typeof c === "string"
      })
    : []

  const derived = deriveTracksFromLegacyStage(stage)
  const artworkStage = isArtworkStage(m.artwork_stage) ? m.artwork_stage : derived.artwork_stage
  const blanksStage = isBlanksStage(m.blanks_stage) ? m.blanks_stage : derived.blanks_stage
  const downstreamStage = isDownstreamStage(stage) ? stage : derived.production_stage

  return { stage, changedAt, history, artworkStage, blanksStage, downstreamStage }
}
