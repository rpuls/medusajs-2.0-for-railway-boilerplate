import { model } from "@medusajs/framework/utils"

/**
 * A customer-owned saved design — the canvas state, thumbnail, and an optional
 * pointer to the base product the design was built against. The full Fabric.js
 * payload (sideLayouts, printArea, customer original files, etc.) lives in
 * `customizer_metadata` so the storefront can rehydrate the customizer or push
 * straight into the cart without consulting any other entity.
 *
 * `customer_id` is denormalised onto this row (rather than a Module Link) so
 * the obvious "list designs for the logged-in customer" filter is a single
 * indexed lookup. A Module Link can be added later if we need `customer.designs`
 * graph queries.
 */
const Design = model
  .define("design", {
    id: model.id({ prefix: "des" }).primaryKey(),
    customer_id: model.text(),
    name: model.text(),
    thumbnail_url: model.text().nullable(),
    base_product_id: model.text().nullable(),
    base_variant_id: model.text().nullable(),
    customizer_metadata: model.json(),
  })
  .indexes([
    {
      on: ["customer_id"],
    },
  ])

export default Design
