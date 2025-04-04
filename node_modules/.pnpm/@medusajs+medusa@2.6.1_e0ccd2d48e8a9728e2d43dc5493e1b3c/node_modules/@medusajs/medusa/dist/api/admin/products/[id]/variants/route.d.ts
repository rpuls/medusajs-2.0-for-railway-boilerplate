import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminProductVariantParams>, res: MedusaResponse<HttpTypes.AdminProductVariantListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateProductVariant & AdditionalData>, res: MedusaResponse<HttpTypes.AdminProductResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map