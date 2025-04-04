import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetProductTypeParamsType, AdminUpdateProductTypeType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetProductTypeParamsType>, res: MedusaResponse<HttpTypes.AdminProductTypeResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateProductTypeType>, res: MedusaResponse<HttpTypes.AdminProductTypeResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminProductTypeDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map