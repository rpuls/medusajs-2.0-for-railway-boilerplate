import { HttpTypes } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminInviteAcceptType } from "../validators";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminInviteAcceptType>, res: MedusaResponse<HttpTypes.AdminAcceptInviteResponse>) => Promise<void>;
export declare const AUTHENTICATE = false;
//# sourceMappingURL=route.d.ts.map