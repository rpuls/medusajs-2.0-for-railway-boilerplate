import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminUpdateInventoryLocationLevelType } from "../../../validators";
export declare const DELETE: (req: MedusaRequest, res: MedusaResponse<HttpTypes.AdminInventoryLevelDeleteResponse>) => Promise<void>;
export declare const POST: (req: MedusaRequest<AdminUpdateInventoryLocationLevelType>, res: MedusaResponse<HttpTypes.AdminInventoryItemResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map