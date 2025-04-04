import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminPostReturnsReqSchemaType } from "./validators";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminOrderFilters>, res: MedusaResponse<HttpTypes.AdminReturnsResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminPostReturnsReqSchemaType>, res: MedusaResponse<HttpTypes.AdminOrderReturnResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map