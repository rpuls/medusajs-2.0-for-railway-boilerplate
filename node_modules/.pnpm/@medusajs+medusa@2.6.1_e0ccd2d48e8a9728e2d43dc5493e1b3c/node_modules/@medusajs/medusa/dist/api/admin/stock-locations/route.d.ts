import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateStockLocation>, res: MedusaResponse<HttpTypes.AdminStockLocationResponse>) => Promise<void>;
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminStockLocationListParams>, res: MedusaResponse<HttpTypes.AdminStockLocationListResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map