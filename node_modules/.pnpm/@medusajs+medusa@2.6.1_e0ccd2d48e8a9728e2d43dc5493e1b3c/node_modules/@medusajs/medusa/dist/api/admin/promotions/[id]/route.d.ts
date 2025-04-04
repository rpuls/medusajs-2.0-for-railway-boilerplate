import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetPromotionParamsType, AdminUpdatePromotionType } from "../validators";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetPromotionParamsType>, res: MedusaResponse<HttpTypes.AdminPromotionResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdatePromotionType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminPromotionResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminPromotionDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map