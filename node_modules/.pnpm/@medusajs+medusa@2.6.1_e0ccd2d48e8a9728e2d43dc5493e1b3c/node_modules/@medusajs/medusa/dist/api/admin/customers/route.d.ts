import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCustomerType } from "./validators";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminCustomerFilters>, res: MedusaResponse<HttpTypes.AdminCustomerListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCustomerType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCustomerResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map