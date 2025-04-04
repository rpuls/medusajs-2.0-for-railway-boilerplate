import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateShippingProfile>, res: MedusaResponse<HttpTypes.AdminShippingProfileResponse>) => Promise<void>;
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminShippingProfileListParams>, res: MedusaResponse<HttpTypes.AdminShippingProfileListResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map