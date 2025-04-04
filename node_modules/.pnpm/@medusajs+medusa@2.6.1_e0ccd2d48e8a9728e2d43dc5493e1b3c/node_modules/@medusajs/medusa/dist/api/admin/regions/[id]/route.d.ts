import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetRegionParamsType, AdminUpdateRegionType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetRegionParamsType>, res: MedusaResponse<HttpTypes.AdminRegionResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateRegionType>, res: MedusaResponse<HttpTypes.AdminRegionResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminRegionDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map