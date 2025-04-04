import { BatchWorkflowInput, BatchWorkflowOutput, ProductTypes, UpdateProductVariantWorkflowInputDTO, CreateProductVariantWorkflowInputDTO } from "@medusajs/framework/types";
/**
 * The product variants to manage.
 */
export interface BatchProductVariantsWorkflowInput extends BatchWorkflowInput<CreateProductVariantWorkflowInputDTO, UpdateProductVariantWorkflowInputDTO> {
}
/**
 * The result of managing the product variants.
 */
export interface BatchProductVariantsWorkflowOutput extends BatchWorkflowOutput<ProductTypes.ProductVariantDTO> {
}
export declare const batchProductVariantsWorkflowId = "batch-product-variants";
/**
 * This workflow creates, updates, and deletes product variants. It's used by the
 * [Manage Variants in a Product Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidvariantsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage the variants of a product. You can also
 * use this within a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or in a custom import script.
 *
 * @example
 * const { result } = await batchProductVariantsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Small Shirt",
 *         product_id: "prod_123",
 *         options: {
 *           Size: "S"
 *         },
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd"
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "variant_123",
 *         title: "Red Pants"
 *       }
 *     ],
 *     delete: ["variant_321"]
 *   }
 * })
 *
 * @summary
 *
 * Create, update, and delete product variants.
 */
export declare const batchProductVariantsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchProductVariantsWorkflowInput, BatchProductVariantsWorkflowOutput, []>;
//# sourceMappingURL=batch-product-variants.d.ts.map