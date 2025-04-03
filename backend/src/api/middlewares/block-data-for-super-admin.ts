import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { UserDTO } from "@medusajs/framework/types";

export async function blockDataForSuperAdmins(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (!req.filterableFields) {
    return next();
  }

  const loggedInUser = req.scope.resolve("loggedInUser", {
    allowUnregistered: true,
  }) as UserDTO;
  if (!loggedInUser) {
    return next();
  }

  const isSuperAdmin =
    loggedInUser.metadata?.is_super_admin && !req.session.impersonate_user_id;
  if (isSuperAdmin) {
    req.filterableFields.id = [];
  }

  return next();
}
