import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateInventoryLocationLevelType, AdminGetInventoryLocationLevelsParamsType } from "../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: MedusaRequest<AdminCreateInventoryLocationLevelType>, res: MedusaResponse<HttpTypes.AdminInventoryItemResponse>) => Promise<void>;
export declare const GET: (req: MedusaRequest<AdminGetInventoryLocationLevelsParamsType>, res: MedusaResponse<HttpTypes.AdminInventoryLevelListResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map