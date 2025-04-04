import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminOrderCreateShipmentType } from "../../../../validators";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminOrderCreateShipmentType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map