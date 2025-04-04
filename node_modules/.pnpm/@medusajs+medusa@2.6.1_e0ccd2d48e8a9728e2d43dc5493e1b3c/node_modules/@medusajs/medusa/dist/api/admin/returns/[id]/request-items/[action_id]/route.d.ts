import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostReturnsRequestItemsActionReqSchemaType } from "../../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostReturnsRequestItemsActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminReturnPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminReturnPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map