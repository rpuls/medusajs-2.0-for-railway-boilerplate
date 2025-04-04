import { BatchWorkflowInput, BatchWorkflowOutput, CreateProductWorkflowInputDTO, ProductTypes, UpdateProductWorkflowInputDTO } from "@medusajs/framework/types";
/**
 * The products to manage.
 */
export interface BatchProductWorkflowInput extends BatchWorkflowInput<CreateProductWorkflowInputDTO, UpdateProductWorkflowInputDTO> {
}
export declare const batchProductsWorkflowId = "batch-products";
/**
 * This workflow creates, updates, or deletes products. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage products in bulk. This is
 * also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @example
 * const { result } = await batchProductsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Shirt",
 *         options: [
 *           {
 *             title: "Color",
 *             values: ["Red", "Brown"]
 *           }
 *         ],
 *         variants: [
 *           {
 *             title: "Red Shirt",
 *             options: {
 *               "Color": "Red"
 *             },
 *             prices: [
 *               {
 *                 amount: 10,
 *                 currency_code: "usd"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prod_123",
 *         title: "Pants"
 *       }
 *     ],
 *     delete: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage products in bulk.
 */
export declare const batchProductsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchProductWorkflowInput, BatchWorkflowOutput<ProductTypes.ProductDTO>, []>;
//# sourceMappingURL=batch-products.d.ts.map