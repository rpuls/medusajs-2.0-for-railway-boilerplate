import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { StoreGetCustomerParamsType, StoreUpdateCustomerType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<StoreGetCustomerParamsType>, res: MedusaResponse<HttpTypes.StoreCustomerResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<StoreUpdateCustomerType>, res: MedusaResponse<HttpTypes.StoreCustomerResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map