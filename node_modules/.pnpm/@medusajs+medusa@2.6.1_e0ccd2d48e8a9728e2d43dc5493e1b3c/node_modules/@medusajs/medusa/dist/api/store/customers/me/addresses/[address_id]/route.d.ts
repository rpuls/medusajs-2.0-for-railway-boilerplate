import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { StoreGetCustomerAddressParamsType, StoreUpdateCustomerAddressType } from "../../../validators";
export declare const GET: (req: AuthenticatedMedusaRequest<StoreGetCustomerAddressParamsType>, res: MedusaResponse<HttpTypes.StoreCustomerAddressResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<StoreUpdateCustomerAddressType>, res: MedusaResponse<HttpTypes.StoreCustomerResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.StoreCustomerAddressDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map