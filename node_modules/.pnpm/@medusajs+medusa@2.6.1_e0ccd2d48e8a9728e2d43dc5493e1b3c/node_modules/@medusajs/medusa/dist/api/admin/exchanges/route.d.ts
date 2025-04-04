import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostOrderExchangesReqSchemaType } from "./validators";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminExchangeListParams>, res: MedusaResponse<HttpTypes.AdminExchangeListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostOrderExchangesReqSchemaType>, res: MedusaResponse<HttpTypes.AdminExchangeOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map