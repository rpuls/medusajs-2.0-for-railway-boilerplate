import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetReservationParamsType, AdminUpdateReservationType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetReservationParamsType>, res: MedusaResponse<HttpTypes.AdminReservationResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateReservationType>, res: MedusaResponse<HttpTypes.AdminReservationResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminReservationDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map