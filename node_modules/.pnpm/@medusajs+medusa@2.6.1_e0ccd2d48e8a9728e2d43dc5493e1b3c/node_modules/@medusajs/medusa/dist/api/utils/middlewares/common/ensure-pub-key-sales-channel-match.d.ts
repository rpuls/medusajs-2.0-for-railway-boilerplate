import { NextFunction } from "express";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { StoreCreateCartType } from "../../../store/carts/validators";
/**
 * If a publishable key (PK) is passed in the header of the request AND
 * the request carries a sales channel id param in the url or body,
 * we check if the sales channel is valid for the key.
 *
 * If the request does not carry a sales channel id, we attempt to assign
 * a sales channel associated with the PK.
 *
 * @throws If sales channel id is passed as a url or body param
 *         but that id is not in the scope defined by the PK from the header.
 *         If the PK is associated with multiple sales channels but no
 *         sales channel id is passed in the request.
 */
export declare function ensurePublishableKeyAndSalesChannelMatch(req: MedusaRequest<StoreCreateCartType> & {
    publishableApiKeyScopes: any;
}, res: MedusaResponse, next: NextFunction): Promise<void>;
//# sourceMappingURL=ensure-pub-key-sales-channel-match.d.ts.map