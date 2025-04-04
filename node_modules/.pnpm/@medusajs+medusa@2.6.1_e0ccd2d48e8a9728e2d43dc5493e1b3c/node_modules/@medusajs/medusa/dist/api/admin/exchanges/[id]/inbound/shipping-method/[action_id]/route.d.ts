import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminPostExchangesShippingActionReqSchemaType } from "../../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostExchangesShippingActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminExchangePreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminExchangeReturnResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map