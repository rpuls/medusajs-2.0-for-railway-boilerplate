import UserModule from "@medusajs/medusa/user";
import StoreModule from "@medusajs/medusa/store";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  UserModule.linkable.user,
  StoreModule.linkable.store
);
