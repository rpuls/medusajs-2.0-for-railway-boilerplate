import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminOrderCreateFulfillmentType } from "../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminOrderCreateFulfillmentType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map