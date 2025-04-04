import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCustomerAddressType } from "../../../validators";
import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminCustomerAddressResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCustomerAddressType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCustomerResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminCustomerAddressDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map