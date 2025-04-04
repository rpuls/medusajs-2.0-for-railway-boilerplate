import { NextFunction } from "express";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
/**
 * If a publishable key (PK) is passed in the header of the request, we attach
 * the IDs of resources within the scope of the key.
 *
 * @param req - request object
 * @param res - response object
 * @param next - next middleware call
 *
 * @throws if sales channel id is passed as a url or body param
 *         but that id is not in the scope defined by the PK from the header
 */
export declare function maybeAttachPublishableKeyScopes(req: MedusaRequest & {
    publishableApiKeyScopes: any;
}, res: MedusaResponse, next: NextFunction): Promise<void>;
//# sourceMappingURL=maybe-attach-pub-key-scopes.d.ts.map