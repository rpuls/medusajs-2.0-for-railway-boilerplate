import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostClaimsShippingActionReqSchemaType } from "../../../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostClaimsShippingActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminClaimPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminClaimPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map