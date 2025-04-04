import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";
import { AdminUpdateTaxRegionType } from "../validators";
export declare const GET: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminTaxRegionResponse>) => Promise<void>;
export declare const POST: (req: AuthenticatedMedusaRequest<AdminUpdateTaxRegionType>, res: MedusaResponse<HttpTypes.AdminTaxRegionResponse>) => Promise<MedusaResponse<HttpTypes.AdminTaxRegionResponse>>;
export declare const DELETE: (req: AuthenticatedMedusaRequest, res: MedusaResponse<HttpTypes.AdminTaxRegionDeleteResponse>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map