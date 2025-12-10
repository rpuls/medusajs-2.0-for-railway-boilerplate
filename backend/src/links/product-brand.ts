import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import BrandModule from "../modules/brand"

// Use BrandModule.linkable.brand - the module exposes linkables when defined in Module()
const brandLinkable = BrandModule.linkable?.brand

if (!brandLinkable) {
  const error = new Error("BrandModule.linkable.brand is undefined! Cannot create link.")
  throw error
}

const linkDefinition = defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  brandLinkable
)

export default linkDefinition

