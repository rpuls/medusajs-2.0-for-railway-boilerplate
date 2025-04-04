import { HttpTypes, RefundReasonResponse } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminUpdatePaymentRefundReasonType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<RefundReasonResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdatePaymentRefundReasonType>, res: MedusaResponse<RefundReasonResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminRefundReasonDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map