import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetSalesChannelParamsType, AdminUpdateSalesChannelType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetSalesChannelParamsType>, res: MedusaResponse<HttpTypes.AdminSalesChannelResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateSalesChannelType>, res: MedusaResponse<HttpTypes.AdminSalesChannelResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminSalesChannelDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map