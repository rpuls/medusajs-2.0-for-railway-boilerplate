import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminGetReservationsParams>, res: MedusaResponse<HttpTypes.AdminReservationListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCreateReservation>, res: MedusaResponse<HttpTypes.AdminReservationResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map