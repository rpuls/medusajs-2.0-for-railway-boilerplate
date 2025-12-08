import { defineLink } from "@medusajs/framework/utils"
import BrandModule from "../modules/brand"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  ProductModule.linkable.product,
  BrandModule.linkable.brand
)

