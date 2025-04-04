import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminGetStoreParamsType, AdminUpdateStoreType } from "../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<AdminGetStoreParamsType>, res: MedusaResponse<HttpTypes.AdminStoreResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateStoreType>, res: MedusaResponse<HttpTypes.AdminStoreResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map