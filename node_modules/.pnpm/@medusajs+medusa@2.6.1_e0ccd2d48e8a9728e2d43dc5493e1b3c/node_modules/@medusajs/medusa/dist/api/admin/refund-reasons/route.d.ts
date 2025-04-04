import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateRefundReason, HttpTypes, PaginatedResponse, RefundReasonResponse, RefundReasonsResponse } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.RefundReasonFilters>, res: MedusaResponse<PaginatedResponse<RefundReasonsResponse>>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateRefundReason>, res: MedusaResponse<RefundReasonResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map