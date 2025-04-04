import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminCreateApiKeyType } from "./validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const GET: (req: AuthenticatedMedusaRequest<HttpTypes.AdminGetApiKeysParams>, res: MedusaResponse<HttpTypes.AdminApiKeyListResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminCreateApiKeyType>, res: MedusaResponse<HttpTypes.AdminApiKeyResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map