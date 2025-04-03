import OrderModule from "@medusajs/medusa/order";
import StoreModule from "@medusajs/medusa/store";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  OrderModule.linkable.order,
  StoreModule.linkable.store
);
