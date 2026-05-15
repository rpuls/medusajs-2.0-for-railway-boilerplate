import { model } from "@medusajs/framework/utils"

/**
 * A reusable print/decoration "recipe" — captures the production
 * settings that worked for a given customer/design/product so a
 * future operator can reproduce the result without consulting senior
 * staff. Keeps institutional knowledge in the system instead of in
 * someone's head.
 *
 * Examples staff might capture:
 *   - Screen print: mesh count, flash temp, squeegee angle, ink type,
 *     curing time, # of strokes per colour.
 *   - DTF: film thickness, powder type, press temperature, dwell.
 *   - Embroidery: thread brand + colours, tension, density, underlay,
 *     digitization file URL.
 *
 * `recipe_json` is freeform so the shape can evolve without
 * migrations. Pin to canonical decoration methods via
 * `decoration_method` for searchability.
 *
 * Linking is loose:
 *   - `product_id` — which garment this recipe was tuned for
 *   - `design_id`  — which saved customer design
 *   - `customer_id`— if a particular customer always wants it this way
 *   - `last_used_order_id` — the most recent order that consumed it
 */
const PrintRecipe = model
  .define("print_recipe", {
    id: model.id({ prefix: "rcp" }).primaryKey(),
    name: model.text(),
    description: model.text().nullable(),
    decoration_method: model
      .enum([
        "screen_print",
        "dtf",
        "embroidery",
        "uv",
        "digital_transfer",
        "vinyl",
        "other",
      ])
      .default("screen_print"),
    product_id: model.text().nullable(),
    variant_id: model.text().nullable(),
    design_id: model.text().nullable(),
    customer_id: model.text().nullable(),
    last_used_order_id: model.text().nullable(),
    last_used_at: model.dateTime().nullable(),
    recipe_json: model.json().default({}),
    notes: model.text().nullable(),
    is_archived: model.boolean().default(false),
    created_by: model.text().nullable(),
  })
  .indexes([
    { on: ["decoration_method"] },
    { on: ["product_id"] },
    { on: ["customer_id"] },
  ])

export default PrintRecipe
