import { model } from "@medusajs/framework/utils"

/**
 * A customer's bookmarked product. `customer_id` and `product_id` are
 * denormalised onto the row so the storefront "list my wishlist" and
 * "is this product in my wishlist?" lookups are single indexed
 * queries. A Module Link layers Medusa graph traversal on top for the
 * admin (`customer.wishlist_items`, `product.wishlisted_by`).
 */
const WishlistItem = model
  .define("wishlist_item", {
    id: model.id({ prefix: "wis" }).primaryKey(),
    customer_id: model.text(),
    product_id: model.text(),
    variant_id: model.text().nullable(),
    note: model.text().nullable(),
  })
  .indexes([
    { on: ["customer_id"] },
    { on: ["product_id"] },
    {
      on: ["customer_id", "product_id"],
      unique: true,
    },
  ])

export default WishlistItem
