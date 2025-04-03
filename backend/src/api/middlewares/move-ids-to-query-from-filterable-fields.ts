import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";

export async function moveIdsToQueryFromFilterableFields(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (!req.filterableFields) {
    return next();
  }
  if (req.filterableFields.id) {
    // do this, otherwise the 'filterableFields' will be overwritten in
    // https://github.com/medusajs/medusa/blob/develop/packages/medusa/src/api/admin/products/middlewares.ts#L49
    req.query["id"] = req.filterableFields.id as string[];
  // this is for /admin/stores to get only one user's store
  } else if (req.filterableFields.store_id) {
    req.query["id"] = req.filterableFields.store_id as string;
  // super admin?
  } else if (req.filterableFields.store_name) {
    req.query["name"] = req.filterableFields.store_name as string;
  }

  return next();
}
