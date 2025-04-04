import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminGetOrdersOrderParamsType, AdminUpdateOrderType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetOrdersOrderParamsType>, res: MedusaResponse<HttpTypes.AdminOrderResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateOrderType>, res: MedusaResponse<HttpTypes.AdminOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map