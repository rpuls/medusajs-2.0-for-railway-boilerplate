import { HttpTypes } from "@medusajs/types"

import {
  CUSTOMER_MILESTONES,
  CUSTOMER_MILESTONE_LABEL,
  PRODUCTION_STAGE_LABEL,
  customerMilestoneForStage,
  milestoneIndex,
  readProductionStageMetadata,
  type CustomerMilestone,
} from "@modules/order/lib/production-stage"

type Props = {
  order: HttpTypes.StoreOrder
}

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return ""
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return ""
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const ProductionStageTracker = ({ order }: Props) => {
  const { stage, changedAt, history } = readProductionStageMetadata(
    (order.metadata ?? null) as Record<string, unknown> | null
  )

  if (!stage) {
    return null
  }

  const activeMilestone: CustomerMilestone = customerMilestoneForStage(stage)
  const activeIndex = milestoneIndex(activeMilestone)

  const lastEntryByMilestone = new Map<CustomerMilestone, string>()
  for (const entry of history) {
    lastEntryByMilestone.set(customerMilestoneForStage(entry.stage), entry.changed_at)
  }

  return (
    <section
      className="bg-ui-bg-subtle rounded-xl p-5"
      data-testid="production-stage-tracker"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-semibold text-ui-fg-base">Order progress</h2>
        <span className="text-xs text-ui-fg-subtle">
          Updated {formatDate(changedAt)}
        </span>
      </div>

      <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:items-start">
        {CUSTOMER_MILESTONES.map((milestone, idx) => {
          const isComplete = idx < activeIndex
          const isCurrent = idx === activeIndex
          const isUpcoming = idx > activeIndex
          const completedAt = lastEntryByMilestone.get(milestone)

          const dotClasses = [
            "flex items-center justify-center rounded-full w-7 h-7 text-xs font-semibold shrink-0",
            isComplete
              ? "bg-[var(--brand-primary)] text-white"
              : isCurrent
              ? "bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary)]/20"
              : "bg-ui-bg-component text-ui-fg-subtle border border-ui-border-base",
          ].join(" ")

          const labelClasses = [
            "text-sm font-medium",
            isUpcoming ? "text-ui-fg-subtle" : "text-ui-fg-base",
          ].join(" ")

          const connectorClasses = [
            "hidden sm:block flex-1 h-0.5 self-center mx-2",
            isComplete ? "bg-[var(--brand-primary)]" : "bg-ui-border-base",
          ].join(" ")

          return (
            <li
              key={milestone}
              className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 sm:text-center"
            >
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 w-full">
                <div className={dotClasses} aria-hidden>
                  {isComplete ? "✓" : idx + 1}
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className={labelClasses}>
                    {CUSTOMER_MILESTONE_LABEL[milestone]}
                  </p>
                  {isCurrent ? (
                    <p className="text-xs text-ui-fg-subtle mt-0.5">
                      {PRODUCTION_STAGE_LABEL[stage]}
                    </p>
                  ) : completedAt ? (
                    <p className="text-xs text-ui-fg-subtle mt-0.5">
                      {formatDate(completedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
              {idx < CUSTOMER_MILESTONES.length - 1 ? (
                <div className={connectorClasses} aria-hidden />
              ) : null}
            </li>
          )
        })}
      </ol>

      {stage === "awaiting_approval" ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Action needed: please reply to our proof email to approve your artwork.
          </p>
          <p className="text-xs text-amber-800 mt-1">
            We can&apos;t move to production until you sign off.
          </p>
        </div>
      ) : null}
    </section>
  )
}

export default ProductionStageTracker
