import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import BrandModule from "../modules/brand"

// Default symmetric defineLink — link rows are unique on (product_id,
// brand_id) tuples, so a brand CAN be linked to many products as long as
// no (product, brand) pair is created twice. The "Cannot create multiple
// links between 'product' and 'brand'" error fires only when the same
// tuple is created twice; the import script handles that with a try/catch
// and a "already linked" warning.
//
// NB: do NOT change the argument order or add isList without a coordinated
// migration — those rename the underlying link table (e.g. from
// `product_product_brand_brand` to a new name) and Medusa's db:sync-links
// will hang on an interactive "delete old table" prompt at boot, which
// keeps the container from passing healthcheck.
export default defineLink(
  ProductModule.linkable.product,
  BrandModule.linkable.brand
)
