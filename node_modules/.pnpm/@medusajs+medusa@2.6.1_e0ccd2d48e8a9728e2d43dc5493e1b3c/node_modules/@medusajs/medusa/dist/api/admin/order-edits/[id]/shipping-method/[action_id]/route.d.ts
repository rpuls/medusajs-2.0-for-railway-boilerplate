import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostOrderEditsShippingActionReqSchemaType } from "../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostOrderEditsShippingActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminOrderEditPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminOrderEditPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map