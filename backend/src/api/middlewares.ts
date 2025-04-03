import { defineMiddlewares } from "@medusajs/medusa";
import { registerLoggedInUser } from "./middlewares/logged-in-user";
import { addStoreIdToFilterableFields } from "./middlewares/add-store-id-to-filterable-fields";
import { maybeApplyLinkFilter } from "@medusajs/framework";
import { moveIdsToQueryFromFilterableFields } from "./middlewares/move-ids-to-query-from-filterable-fields";
import { checkApiKey } from "./middlewares/check-api-key";
import { onlyForSuperAdmins } from "./middlewares/only-for-super-admin";

export default defineMiddlewares({
  routes: [
    {
      method: ["GET", "POST"],
      matcher: "/admin/*",
      middlewares: [registerLoggedInUser],
    },
    {
      method: ["GET"],
      matcher: "/admin/products",
      middlewares: [
        addStoreIdToFilterableFields,
        maybeApplyLinkFilter({
          entryPoint: "product_store",
          resourceId: "product_id",
          filterableField: "store_id",
        }),
        moveIdsToQueryFromFilterableFields,
      ],
    },
    {
      method: ["GET"],
      matcher: "/admin/orders",
      middlewares: [
        addStoreIdToFilterableFields,
        maybeApplyLinkFilter({
          entryPoint: "order_store",
          resourceId: "order_id",
          filterableField: "store_id",
        }),
        moveIdsToQueryFromFilterableFields,
      ],
    },
    {
      method: ["GET"],
      matcher: "/admin/users",
      middlewares: [
        addStoreIdToFilterableFields,
        maybeApplyLinkFilter({
          entryPoint: "user_store",
          resourceId: "user_id",
          filterableField: "store_id",
        }),
        moveIdsToQueryFromFilterableFields,
      ],
    },
    {
      method: ["GET"],
      matcher: "/admin/stores",
      middlewares: [
        addStoreIdToFilterableFields,
        moveIdsToQueryFromFilterableFields,
      ],
    },
    {
      method: ["POST"],
      matcher: "/create-super-store",
      middlewares: [checkApiKey],
    },
    {
      method: ["POST"],
      matcher: "/admin/impersonate",
      middlewares: [onlyForSuperAdmins],
    },
    {
      method: ["POST"],
      matcher: "/admin/impersonate-reset",
      middlewares: [onlyForSuperAdmins],
    },
  ],
});
