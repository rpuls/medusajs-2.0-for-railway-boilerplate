import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { StoreCreateCustomerAddressType, StoreGetCustomerAddressesParamsType } from "../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<StoreGetCustomerAddressesParamsType>, res: MedusaResponse<HttpTypes.StoreCustomerAddressListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<StoreCreateCustomerAddressType>, res: MedusaResponse<HttpTypes.StoreCustomerResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map