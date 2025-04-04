import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { StoreUpdateCartLineItemType } from "../../../validators";
export declare const POST: (req: MedusaRequest<StoreUpdateCartLineItemType>, res: MedusaResponse<HttpTypes.StoreCartResponse>) => Promise<void>;
export declare const DELETE: (req: MedusaRequest, res: MedusaResponse<HttpTypes.StoreLineItemDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map