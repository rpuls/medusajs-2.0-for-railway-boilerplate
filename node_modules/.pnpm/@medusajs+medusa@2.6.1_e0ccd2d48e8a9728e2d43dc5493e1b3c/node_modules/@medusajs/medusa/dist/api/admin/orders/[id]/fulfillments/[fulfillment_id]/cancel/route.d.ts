import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminOrderCancelFulfillmentType } from "../../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminOrderCancelFulfillmentType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map