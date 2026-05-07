/**
 * SYNC TARGET: storefront/src/modules/order/lib/production-stage.ts
 *
 * Backend = canonical source for stages, labels, milestone mapping, and email
 * triggers. The storefront keeps a parallel file (different package, can't
 * share imports) and `scripts/check-production-stage-sync.mjs` enforces parity
 * — run that after editing here.
 *
 * Production-stage tracking shared by the admin widget, the stage-update API,
 * the storefront tracker, and the subscriber that fires customer emails.
 *
 * Internal stages are granular for staff workflow visibility. The storefront
 * collapses them into a smaller set of customer-facing milestones (see
 * `customerMilestoneForStage`). Only the stages in `STAGES_THAT_EMAIL` send a
 * customer notification — keeps inbox noise down.
 *
 * `shipped` is intentionally NOT email-triggering here: the existing
 * `order-shipment-created` subscriber already sends the tracking email when
 * Medusa emits a real shipment.
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

/** Stages that trigger a customer email when an order transitions INTO them. */
export const STAGES_THAT_EMAIL: ReadonlySet<ProductionStage> = new Set<ProductionStage>([
  "awaiting_approval",
  "in_production",
])

export function isProductionStage(value: unknown): value is ProductionStage {
  return typeof value === "string" && (PRODUCTION_STAGES as readonly string[]).includes(value)
}

export type ProductionStageHistoryEntry = {
  stage: ProductionStage
  changed_at: string
  changed_by?: string | null
  note?: string | null
}

export type ProductionStageMetadata = {
  production_stage: ProductionStage
  production_stage_changed_at: string
  production_stage_history: ProductionStageHistoryEntry[]
}

export const PRODUCTION_STAGE_EVENT = "order.production_stage_changed"

export type ProductionStageChangedEvent = {
  order_id: string
  from_stage: ProductionStage | null
  to_stage: ProductionStage
  changed_at: string
  changed_by?: string | null
  note?: string | null
}
