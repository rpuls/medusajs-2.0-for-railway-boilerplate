import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostOrderEditsItemsActionReqSchemaType } from "../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostOrderEditsItemsActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminOrderEditPreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminOrderEditPreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map