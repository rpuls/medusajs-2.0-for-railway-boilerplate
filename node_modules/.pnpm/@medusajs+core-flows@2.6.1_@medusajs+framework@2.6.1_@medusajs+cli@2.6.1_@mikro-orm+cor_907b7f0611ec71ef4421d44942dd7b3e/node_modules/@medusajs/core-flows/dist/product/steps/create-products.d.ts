import { ProductTypes } from "@medusajs/framework/types";
export declare const createProductsStepId = "create-products";
/**
 * This step creates one or more products.
 *
 * @example
 * const data = createProductsStep([{
 *   title: "Shirt",
 *   options: [
 *     {
 *       title: "Size",
 *       values: ["S", "M", "L"]
 *     }
 *   ],
 *   variants: [
 *     {
 *       title: "Small Shirt",
 *       options: {
 *         Size: "S"
 *       }
 *     }
 *   ]
 * }])
 */
export declare const createProductsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ProductTypes.CreateProductDTO[], ProductTypes.ProductDTO[]>;
//# sourceMappingURL=create-products.d.ts.map