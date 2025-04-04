import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetShippingOptionParamsType, AdminUpdateShippingOptionType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetShippingOptionParamsType>, res: MedusaResponse<HttpTypes.AdminShippingOptionResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateShippingOptionType>, res: MedusaResponse<HttpTypes.AdminShippingOptionResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminShippingOptionDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map