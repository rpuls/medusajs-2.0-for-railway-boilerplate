import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminPostReturnsRequestItemsActionReqSchemaType } from "../../../../../returns/validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostReturnsRequestItemsActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminClaimReturnPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminClaimReturnPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map