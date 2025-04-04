import { AdminFulfillmentSetResponse, AdminServiceZoneResponse, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminUpdateFulfillmentSetServiceZonesType } from "../../../validators";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<AdminServiceZoneResponse>) => Promise<void>;
export declare const POST: (req: MedusaRequest<AdminUpdateFulfillmentSetServiceZonesType>, res: MedusaResponse<AdminFulfillmentSetResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminServiceZoneDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map