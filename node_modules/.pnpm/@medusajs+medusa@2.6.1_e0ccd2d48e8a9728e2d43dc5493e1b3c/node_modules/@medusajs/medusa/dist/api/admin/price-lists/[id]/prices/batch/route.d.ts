import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BatchMethodRequest, HttpTypes } from "@medusajs/framework/types";
import { AdminCreatePriceListPriceType, AdminUpdatePriceListPriceType } from "../../../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<BatchMethodRequest<AdminCreatePriceListPriceType, AdminUpdatePriceListPriceType>>, res: MedusaResponse<HttpTypes.AdminPriceListBatchResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map