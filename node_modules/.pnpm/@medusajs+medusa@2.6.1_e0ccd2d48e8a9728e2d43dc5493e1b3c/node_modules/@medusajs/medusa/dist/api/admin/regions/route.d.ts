import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminRegionFilters>, res: MedusaResponse<HttpTypes.AdminRegionListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateRegion>, res: MedusaResponse<HttpTypes.AdminRegionResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map