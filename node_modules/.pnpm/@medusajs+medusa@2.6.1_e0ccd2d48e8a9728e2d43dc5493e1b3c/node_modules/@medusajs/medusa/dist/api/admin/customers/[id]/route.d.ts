import { AdditionalData, HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminUpdateCustomerType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminCustomerResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateCustomerType & AdditionalData>, res: MedusaResponse<HttpTypes.AdminCustomerResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminCustomerDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map