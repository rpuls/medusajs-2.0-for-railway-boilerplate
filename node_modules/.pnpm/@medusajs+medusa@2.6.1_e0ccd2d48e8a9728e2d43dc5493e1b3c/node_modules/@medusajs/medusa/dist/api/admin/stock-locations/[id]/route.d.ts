import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetStockLocationParamsType, AdminUpdateStockLocationType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateStockLocationType>, res: MedusaResponse<HttpTypes.AdminStockLocationResponse>) => Promise<void>;
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetStockLocationParamsType>, res: MedusaResponse<HttpTypes.AdminStockLocationResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminStockLocationDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map