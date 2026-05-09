import { model } from "@medusajs/framework/utils"

/**
 * Operator-curated threshold alert. Evaluated nightly: when the named
 * metric crosses the threshold per the comparator, an email fires to the
 * recipient inbox. Dormant for `cooldown_days` after a fire so a stuck
 * red signal doesn't spam every morning.
 *
 * Metric keys (canonical, match the evaluator in
 * services/report-alerts/evaluate.ts):
 *   - sla_breach_pct_7d           breach % over last 7 days
 *   - currently_breaching_count   open orders past stage SLA right now
 *   - reprint_rate_7d             % of orders rolled back in last 7 days
 *   - dead_stock_units            units in stock unsold 180+ days
 *   - capacity_red                fires when capacity_status = "red"
 *   - top10_customer_share        share of revenue from top 10 customers
 *
 * Comparator semantics:
 *   - "gt"  fire when value >  threshold
 *   - "gte" fire when value >= threshold
 *   - "lt"  fire when value <  threshold
 *   - "lte" fire when value <= threshold
 *   - "eq"  fire when value == threshold (use for capacity_red etc.)
 */
const ReportAlert = model
  .define("report_alert", {
    id: model.id({ prefix: "alrt" }).primaryKey(),
    name: model.text(),
    metric: model.text(),
    comparator: model.text(),
    threshold: model.number(),
    recipient_email: model.text(),
    cooldown_days: model.number().default(7),
    enabled: model.boolean().default(true),
    last_fired_at: model.text().nullable(),
    last_value: model.number().nullable(),
  })
  .indexes([{ on: ["enabled"] }])

export default ReportAlert
