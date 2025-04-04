import { ProductTypes } from "@medusajs/framework/types";
export declare const createProductOptionsStepId = "create-product-options";
/**
 * This step creates one or more product options.
 *
 * @example
 * const data = createProductOptionsStep([{
 *   title: "Size",
 *   values: ["S", "M", "L"]
 * }])
 */
export declare const createProductOptionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ProductTypes.CreateProductOptionDTO[], ProductTypes.ProductOptionDTO[]>;
//# sourceMappingURL=create-product-options.d.ts.map