import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminPostClaimsShippingActionReqSchemaType } from "../../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostClaimsShippingActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminClaimPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminClaimReturnPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map