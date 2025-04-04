import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminPostExchangesRequestItemsReturnActionReqSchemaType } from "../../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostExchangesRequestItemsReturnActionReqSchemaType>, res: MedusaResponse<HttpTypes.AdminExchangeReturnResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminExchangeReturnResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map