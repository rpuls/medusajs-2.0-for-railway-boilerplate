import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetShippingProfileParamsType, AdminUpdateShippingProfileType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetShippingProfileParamsType>, res: MedusaResponse<HttpTypes.AdminShippingProfileResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminShippingProfileDeleteResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateShippingProfileType>, res: MedusaResponse<HttpTypes.AdminShippingProfileResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map