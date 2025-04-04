import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCampaignType } from "./validators";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminGetCampaignParams>, res: MedusaResponse<HttpTypes.AdminCampaignListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCampaignType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCampaignResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map