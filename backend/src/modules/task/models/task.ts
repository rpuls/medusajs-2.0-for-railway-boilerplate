import { model } from "@medusajs/framework/utils"

/**
 * A staff-facing to-do anchored to any combination of customer, order,
 * quote, or organisation. Single assignee per task — primary owner +
 * watchers is deferred (the order watcher feature already covers the
 * notification-fan-out use case for orders).
 *
 * Denormalised `customer_id` / `order_id` / `quote_id` / `organisation_id`
 * sit alongside Module Links (in `backend/src/links/{customer,order,
 * quote,organisation}-tasks.ts`) — the link tables give graph-query
 * traversal (`customer.tasks`), the FK columns give cheap indexed
 * filtering for "my open tasks where customer_id = X".
 */
const Task = model
  .define("task", {
    id: model.id({ prefix: "tsk" }).primaryKey(),
    assignee_user_id: model.text(),
    customer_id: model.text().nullable(),
    order_id: model.text().nullable(),
    quote_id: model.text().nullable(),
    organisation_id: model.text().nullable(),
    title: model.text(),
    body: model.text().nullable(),
    due_at: model.dateTime().nullable(),
    status: model
      .enum(["open", "in_progress", "done", "cancelled"])
      .default("open"),
    priority: model
      .enum(["low", "normal", "high", "urgent"])
      .default("normal"),
    completed_at: model.dateTime().nullable(),
    completed_by: model.text().nullable(),
    created_by: model.text().nullable(),
    metadata: model.json().default({}),
    last_overdue_notified_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["assignee_user_id"] },
    { on: ["status"] },
    { on: ["due_at"] },
    { on: ["customer_id"] },
    { on: ["order_id"] },
    { on: ["quote_id"] },
    { on: ["organisation_id"] },
  ])

export default Task
