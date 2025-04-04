import { AdminReturnReasonResponse, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminReturnReasonResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminUpdateReturnReason>, res: MedusaResponse<AdminReturnReasonResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminReturnReasonDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map