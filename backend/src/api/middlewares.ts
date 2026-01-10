import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { PostAdminUpdateBranding } from "./admin/branding/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/branding",
      method: ["POST", "PUT"],
      middlewares: [validateAndTransformBody(PostAdminUpdateBranding)],
    },
  ],
});

