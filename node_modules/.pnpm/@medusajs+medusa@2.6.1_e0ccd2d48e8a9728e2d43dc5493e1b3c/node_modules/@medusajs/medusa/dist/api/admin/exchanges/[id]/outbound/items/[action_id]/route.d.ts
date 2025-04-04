import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostExchangesItemsActionReqSchemaType } from "../../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostExchangesItemsActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminExchangePreviewResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminExchangePreviewResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map