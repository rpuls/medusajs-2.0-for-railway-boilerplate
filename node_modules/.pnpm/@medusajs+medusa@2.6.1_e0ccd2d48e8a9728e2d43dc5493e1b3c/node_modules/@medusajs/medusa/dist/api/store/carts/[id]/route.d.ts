import { AdditionalData, HttpTypes, UpdateCartDataDTO } from "@medusajs/framework/types";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export declare const GET: (req: MedusaRequest, res: MedusaResponse<HttpTypes.StoreCartResponse>) => Promise<void>;
export declare const POST: (req: MedusaRequest<UpdateCartDataDTO & AdditionalData>, res: MedusaResponse<{
    cart: HttpTypes.StoreCart;
}>) => Promise<void>;
//# sourceMappingURL=route.d.ts.map