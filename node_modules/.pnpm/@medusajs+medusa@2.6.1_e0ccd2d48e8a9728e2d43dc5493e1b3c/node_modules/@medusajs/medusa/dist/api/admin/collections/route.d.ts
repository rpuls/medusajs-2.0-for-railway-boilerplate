import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCollectionType } from "./validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCollectionListParams>, res: MedusaResponse<HttpTypes.AdminCollectionListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCollectionType>, res: MedusaResponse<HttpTypes.AdminCollectionResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map