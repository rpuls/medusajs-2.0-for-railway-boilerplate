import { AdminProductCategoryResponse, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminProductCategoryParamsType, AdminUpdateProductCategoryType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminProductCategoryParamsType>, res: MedusaResponse<AdminProductCategoryResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateProductCategoryType>, res: MedusaResponse<AdminProductCategoryResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminProductCategoryDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map