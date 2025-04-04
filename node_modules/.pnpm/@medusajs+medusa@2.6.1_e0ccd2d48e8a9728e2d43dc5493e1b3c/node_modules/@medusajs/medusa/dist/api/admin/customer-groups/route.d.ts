import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateCustomerGroupType } from "./validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminGetCustomerGroupsParams>, res: MedusaResponse<HttpTypes.AdminCustomerGroupListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateCustomerGroupType>, res: MedusaResponse<HttpTypes.AdminCustomerGroupResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map