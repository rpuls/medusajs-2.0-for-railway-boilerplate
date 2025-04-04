import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetInventoryItemParamsType, AdminUpdateInventoryItemType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: MedusaRequest<AdminGetInventoryItemParamsType>, res: MedusaResponse<HttpTypes.AdminInventoryItemResponse>) => Promise<void>;
export declare const POST: (req: MedusaRequest<AdminUpdateInventoryItemType>, res: MedusaResponse<HttpTypes.AdminInventoryItemResponse>) => Promise<void>;
export declare const DELETE: (req: MedusaRequest, res: MedusaResponse<HttpTypes.AdminInventoryItemDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map