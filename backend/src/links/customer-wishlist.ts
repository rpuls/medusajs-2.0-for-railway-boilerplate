import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import WishlistModule from "../modules/wishlist"

/**
 * One customer has many wishlist items. Run `npx medusa db:sync-links`
 * after adding to materialise the link table.
 */
export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: WishlistModule.linkable.wishlistItem,
    isList: true,
  }
)
