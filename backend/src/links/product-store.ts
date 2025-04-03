import ProductModule from "@medusajs/medusa/product";
import StoreModule from "@medusajs/medusa/store";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  ProductModule.linkable.product,
  StoreModule.linkable.store
);
