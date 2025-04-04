import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostOrderClaimsReqSchemaType } from "./validators";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminClaimListParams>, res: MedusaResponse<HttpTypes.AdminClaimListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostOrderClaimsReqSchemaType>, res: MedusaResponse<HttpTypes.AdminClaimOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map