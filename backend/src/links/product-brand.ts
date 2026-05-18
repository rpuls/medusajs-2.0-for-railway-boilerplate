import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import BrandModule from "../modules/brand"

// Many products belong to one brand. The PRODUCT side carries `isList: true` so the
// link engine's uniqueness validator (see
// node_modules/@medusajs/modules-sdk/dist/link.js around line 294) switches from the
// default "reject if EITHER product_id or brand_id already exists" to "reject only if
// THIS product is already linked to a DIFFERENT brand". Without isList, the very
// first product per brand wins and every subsequent link.create() for that brand
// throws "Cannot create multiple links" — which is exactly the bug that left us with
// 1 link per brand in production.
//
// The link table name (`product_product_brand_brand`) is derived from the moduleA /
// aliasA / moduleB / aliasB combination (see
// node_modules/@medusajs/utils/dist/link/compose-link-name.js), none of which change
// when isList flips. The table is therefore preserved across this change. `database`
// is set explicitly anyway as belt-and-braces, so any future framework-level naming
// change does not silently rename the table and trigger an interactive
// "delete old table" prompt at db:sync-links time (which would block the container
// from passing healthcheck on Railway).
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true },
  BrandModule.linkable.brand,
  { database: { table: "product_product_brand_brand" } }
)
