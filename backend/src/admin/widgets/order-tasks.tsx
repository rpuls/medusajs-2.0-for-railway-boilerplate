import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { TaskQuickAdd } from "../components/task-quick-add"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Order = { id: string }

const OrderTasksWidget = ({ data: order }: { data: Order }) => {
  if (!order?.id) return null
  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Tasks
          <HelpTooltip
            text={{
              title: "Tasks anchored to this order",
              body: "Active tasks (open + in_progress) anchored to this order. Stale-order escalation (Phase 11) auto-creates one — 'Investigate stale order #N' — when an order goes stale.",
              bullets: [
                "Use this for one-off work tied to this order: 'Re-check artwork dimensions', 'Call customer to confirm sleeve choice'.",
                "Auto-created stale tasks land here too; complete them once the underlying stage moves forward.",
                "Owner of the order auto-inherits as the natural assignee — but pick anyone in rotation.",
              ],
            }}
          />
        </Heading>
      </div>
      <div className="px-6 pb-4">
        <TaskQuickAdd
          anchor="order_id"
          anchorId={order.id}
          title="Tasks"
          helpBody="One-off work tied to this order."
        />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderTasksWidget, "order-tasks")
