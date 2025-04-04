import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminProductListParams>, res: MedusaResponse<HttpTypes.AdminProductListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProduct & AdditionalData>, res: MedusaResponse<HttpTypes.AdminProductResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map