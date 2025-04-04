import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateTaxRegion>, res: MedusaResponse<HttpTypes.AdminTaxRegionResponse>) => Promise<void>;
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminTaxRegionListParams>, res: MedusaResponse<HttpTypes.AdminTaxRegionListResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map