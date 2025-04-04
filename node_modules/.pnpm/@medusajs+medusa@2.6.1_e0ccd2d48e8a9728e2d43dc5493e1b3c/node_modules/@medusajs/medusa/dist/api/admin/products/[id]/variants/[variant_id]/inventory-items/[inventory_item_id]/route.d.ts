import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AdminUpdateVariantInventoryItemType } from "../../../../../validators";
import { HttpTypes } from "@medusajs/framework/types";
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateVariantInventoryItemType>, res: MedusaResponse<HttpTypes.AdminProductVariantResponse>) => Promise<void>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminProductVariantInventoryLinkDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map