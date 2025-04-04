import { ProductTypes } from "@medusajs/framework/types";
export declare const createProductVariantsStepId = "create-product-variants";
/**
 * This step creates one or more product variants.
 *
 * @example
 * const data = createProductVariantsStep([{
 *   title: "Small Shirt",
 *   options: {
 *     Size: "S",
 *   },
 *   product_id: "prod_123",
 * }])
 */
export declare const createProductVariantsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ProductTypes.CreateProductVariantDTO[], ProductTypes.ProductVariantDTO[]>;
//# sourceMappingURL=create-product-variants.d.ts.map