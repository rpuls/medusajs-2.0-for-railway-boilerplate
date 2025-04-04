import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostReceiveReturnsReqSchemaType } from "../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostReceiveReturnsReqSchemaType>, res: MedusaResponse<HttpTypes.AdminOrderReturnResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminReturnDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map