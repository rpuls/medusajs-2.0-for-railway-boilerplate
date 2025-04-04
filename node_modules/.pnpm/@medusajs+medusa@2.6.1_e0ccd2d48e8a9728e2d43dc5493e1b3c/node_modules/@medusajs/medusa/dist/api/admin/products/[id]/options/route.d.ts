import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminProductOptionParams>, res: MedusaResponse<HttpTypes.AdminProductOptionListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProductOption & AdditionalData>, res: MedusaResponse<HttpTypes.AdminProductResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map