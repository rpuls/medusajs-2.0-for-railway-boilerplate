import { model } from "@medusajs/framework/utils"

/**
 * Per-job spoilage / reject log. One row per "we threw something away
 * during production for this order". Powers waste reporting + supplier
 * defect tracking.
 *
 * `reason` is an enum so the staff form has guardrails and the
 * report can roll up cleanly.
 *   - misprint:      operator error on the press / machine
 *   - wrong_size:    wrong size pulled or printed
 *   - damaged_blank: garment arrived already damaged from supplier
 *   - supplier_defect: subtler quality issue (stitch, dye, weave)
 *   - artwork_error: customer artwork was unprintable / sent in wrong
 *   - other:         free-text in notes
 *
 * `cost_estimate_cents` lets staff capture replacement cost (in minor
 * units, matching Medusa pricing convention) so reporting can sum
 * dollar value of waste per supplier / month / reason.
 */
const ProductionReject = model
  .define("production_reject", {
    id: model.id({ prefix: "prj" }).primaryKey(),
    order_id: model.text(),
    order_line_item_id: model.text().nullable(),
    product_id: model.text().nullable(),
    variant_id: model.text().nullable(),
    supplier_brand_id: model.text().nullable(),
    qty: model.number(),
    reason: model
      .enum([
        "misprint",
        "wrong_size",
        "damaged_blank",
        "supplier_defect",
        "artwork_error",
        "other",
      ])
      .default("misprint"),
    notes: model.text().nullable(),
    cost_estimate_cents: model.number().default(0),
    currency_code: model.text().default("aud"),
    logged_by: model.text().nullable(),
  })
  .indexes([
    { on: ["order_id"] },
    { on: ["reason"] },
    { on: ["supplier_brand_id"] },
  ])

export default ProductionReject
