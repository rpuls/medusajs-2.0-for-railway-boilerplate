import { model } from "@medusajs/framework/utils"

/**
 * An immutable snapshot of a Design at a point in time. Created
 * whenever the customer saves changes to a design they've previously
 * stored — gives them a "v1 / v2 / v3" history they can roll back to
 * (important when a school logo gets re-uploaded but the actual
 * uniform run isn't ready to switch yet).
 *
 * `design_id` + `version` is the natural compound key (enforced via
 * unique index). The latest version is always the largest `version`
 * for a given `design_id`.
 */
const DesignVersion = model
  .define("design_version", {
    id: model.id({ prefix: "dv" }).primaryKey(),
    design_id: model.text(),
    customer_id: model.text(),
    version: model.number(),
    name: model.text(),
    thumbnail_url: model.text().nullable(),
    base_product_id: model.text().nullable(),
    base_variant_id: model.text().nullable(),
    customizer_metadata: model.json(),
  })
  .indexes([
    { on: ["design_id"] },
    { on: ["customer_id"] },
    {
      on: ["design_id", "version"],
      unique: true,
    },
  ])

export default DesignVersion
