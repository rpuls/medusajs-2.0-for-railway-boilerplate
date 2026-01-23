import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { PostAdminUpdateBranding } from "./admin/branding/validators";
import { GetBestSellersSchema } from "./store/best-sellers/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/branding",
      method: ["POST", "PUT"],
      middlewares: [validateAndTransformBody(PostAdminUpdateBranding)],
    },
    {
      matcher: "/store/best-sellers",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetBestSellersSchema, {
          defaults: ["id", "product_id", "category_id", "collection_id", "selling_count"],
          isList: true,
        }),
      ],
    },
  ],
});

