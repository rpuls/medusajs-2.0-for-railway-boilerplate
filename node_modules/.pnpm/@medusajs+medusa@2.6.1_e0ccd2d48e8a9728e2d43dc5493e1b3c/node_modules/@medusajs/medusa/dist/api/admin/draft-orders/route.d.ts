import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AdminCreateDraftOrderType } from "./validators";
export declare const GET: (req: MedusaRequest<HttpTypes.AdminOrderFilters>, res: MedusaResponse<HttpTypes.AdminDraftOrderListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateDraftOrderType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminDraftOrderResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map