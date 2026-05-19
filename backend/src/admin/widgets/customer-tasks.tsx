import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { TaskQuickAdd } from "../components/task-quick-add"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Customer = { id: string }

const CustomerTasksWidget = ({ data: customer }: { data: Customer }) => {
  if (!customer?.id) return null
  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Tasks
          <HelpTooltip
            text={{
              title: "Tasks anchored to this customer",
              body: "Active tasks (open + in_progress) that are anchored to this customer. Tasks created here automatically link to the customer and show up on both this widget AND the assignee's /app/tasks queue.",
              bullets: [
                "Use this for one-off follow-ups: 'Call Alice tomorrow about her sample order'.",
                "Set assignee to a teammate or yourself.",
                "Click Done from any context (widget or /app/tasks) to close.",
                "Automation rules with create_task action can target this customer.",
              ],
            }}
          />
        </Heading>
      </div>
      <div className="px-6 pb-4">
        <TaskQuickAdd
          anchor="customer_id"
          anchorId={customer.id}
          title="Tasks"
          helpBody="One-off follow-ups for this customer."
        />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default withWidgetBoundary(CustomerTasksWidget, "customer-tasks")
