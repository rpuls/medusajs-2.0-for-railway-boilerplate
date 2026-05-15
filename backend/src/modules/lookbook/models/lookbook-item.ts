import { model } from "@medusajs/framework/utils"

/**
 * A single tile on the public lookbook page. Each tile is a real
 * previous job — photo, short caption, optional tags, and (optional)
 * pointers to the product(s) that featured in it so the visitor can
 * click through to buy the same garment.
 *
 * Free-form `tags` array lets staff group items by theme (sports,
 * corporate, school, embroidery, etc.) for the lookbook filters.
 *
 * `weight` controls position — lower = earlier. Staff drag rows in
 * the admin to reorder.
 */
const LookbookItem = model
  .define("lookbook_item", {
    id: model.id({ prefix: "lb" }).primaryKey(),
    title: model.text(),
    description: model.text().nullable(),
    image_url: model.text(),
    /** Reference to the original order — soft pointer, no FK. */
    order_id: model.text().nullable(),
    /** Product IDs the tile features (so clicks deep-link). */
    product_ids: model.json().default({}),
    tags: model.json().default({}),
    /** "Photo by ${attribution}" badge on the tile. */
    attribution: model.text().nullable(),
    is_published: model.boolean().default(true),
    weight: model.number().default(0),
    created_by: model.text().nullable(),
  })
  .indexes([{ on: ["is_published"] }, { on: ["weight"] }])

export default LookbookItem
