import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminGetPromotionsParams>, res: MedusaResponse<HttpTypes.AdminPromotionListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreatePromotion & AdditionalData>, res: MedusaResponse<HttpTypes.AdminPromotionResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map