import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/types";
export interface UpdateProviderJwtPayload {
    entity_id: string;
    actor_type: string;
    provider: string;
}
export declare const validateToken: () => (req: MedusaRequest<HttpTypes.AdminUpdateProvider>, res: MedusaResponse, next: MedusaNextFunction) => Promise<void>;
//# sourceMappingURL=validate-token.d.ts.map