import { BatchMethodResponse, BatchResponse, HttpTypes, LinkDefinition, MedusaContainer, PriceDTO, ProductDTO, ProductVariantDTO } from "@medusajs/framework/types";
import { AdminBatchVariantInventoryItemsType } from "./validators";
export declare const remapKeysForProduct: (selectFields: string[]) => string[];
export declare const remapKeysForVariant: (selectFields: string[]) => string[];
export declare const remapProductResponse: (product: ProductDTO) => HttpTypes.AdminProduct;
export declare const remapVariantResponse: (variant: ProductVariantDTO) => HttpTypes.AdminProductVariant;
export declare const buildRules: (price: PriceDTO) => Record<string, string>;
export declare const refetchVariant: (variantId: string, scope: MedusaContainer, fields: string[]) => Promise<HttpTypes.AdminProductVariant>;
export declare const refetchBatchProducts: (batchResult: BatchMethodResponse<ProductDTO>, scope: MedusaContainer, fields: string[]) => Promise<BatchResponse<ProductDTO>>;
export declare const refetchBatchVariants: (batchResult: BatchMethodResponse<ProductVariantDTO>, scope: MedusaContainer, fields: string[]) => Promise<BatchResponse<ProductVariantDTO>>;
export declare const buildBatchVariantInventoryData: (inputs: AdminBatchVariantInventoryItemsType["create"] | AdminBatchVariantInventoryItemsType["update"] | AdminBatchVariantInventoryItemsType["delete"]) => LinkDefinition[];
//# sourceMappingURL=helpers.d.ts.map