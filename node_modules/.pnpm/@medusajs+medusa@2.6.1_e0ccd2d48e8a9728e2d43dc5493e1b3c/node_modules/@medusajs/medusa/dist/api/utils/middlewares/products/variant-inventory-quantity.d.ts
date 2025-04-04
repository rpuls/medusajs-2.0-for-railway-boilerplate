import { MedusaRequest, MedusaStoreRequest } from "@medusajs/framework/http";
export declare const wrapVariantsWithTotalInventoryQuantity: (req: MedusaRequest, variants: VariantInput[]) => Promise<void>;
export declare const wrapVariantsWithInventoryQuantityForSalesChannel: (req: MedusaStoreRequest<unknown>, variants: VariantInput[]) => Promise<void>;
type VariantInput = {
    id: string;
    inventory_quantity?: number;
    manage_inventory?: boolean;
};
export {};
//# sourceMappingURL=variant-inventory-quantity.d.ts.map