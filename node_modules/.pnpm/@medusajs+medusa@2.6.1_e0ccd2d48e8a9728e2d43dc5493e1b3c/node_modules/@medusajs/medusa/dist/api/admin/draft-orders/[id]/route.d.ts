import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminUpdateDraftOrderType } from "../validators";
export declare const GET: (req: MedusaRequest, res: MedusaResponse<HttpTypes.AdminDraftOrderResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateDraftOrderType>, res: MedusaResponse<HttpTypes.AdminDraftOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map