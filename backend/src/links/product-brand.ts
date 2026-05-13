import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import BrandModule from "../modules/brand"

// Each brand has MANY products, each product has at most ONE brand. In
// Medusa's defineLink, `isList: true` on the second argument means the
// first side owns a list of the second side — i.e. brand → many products.
// Previously this defaulted to 1-to-1 which broke bulk importers (only
// the first product to link to a given brand would succeed; everything
// else hit "Cannot create multiple links between 'product' and 'brand'").
export default defineLink(
  BrandModule.linkable.brand,
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  }
)
