import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCustomerAddressType } from "../../validators";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCustomerAddressFilters>, res: MedusaResponse<HttpTypes.AdminCustomerAddressListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCustomerAddressType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCustomerResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map