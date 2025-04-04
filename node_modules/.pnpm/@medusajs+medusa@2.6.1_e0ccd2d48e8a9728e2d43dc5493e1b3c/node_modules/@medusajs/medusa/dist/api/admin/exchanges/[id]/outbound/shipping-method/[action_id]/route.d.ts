import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostExchangesShippingActionReqSchemaType } from "../../../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostExchangesShippingActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminExchangePreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminExchangePreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map