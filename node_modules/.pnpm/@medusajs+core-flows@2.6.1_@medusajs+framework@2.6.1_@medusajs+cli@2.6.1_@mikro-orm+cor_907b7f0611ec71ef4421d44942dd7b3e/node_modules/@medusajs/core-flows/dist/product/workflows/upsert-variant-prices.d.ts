import { CreatePricesDTO, UpdatePricesDTO } from "@medusajs/framework/types";
/**
 * The data to create, update, or remove variants' prices.
 */
export type UpsertVariantPricesWorkflowInput = {
    /**
     * The variants to create or update prices for.
     */
    variantPrices: {
        /**
         * The ID of the variant to create or update prices for.
         */
        variant_id: string;
        /**
         * The ID of the product the variant belongs to.
         */
        product_id: string;
        /**
         * The prices to create or update for the variant.
         */
        prices?: (CreatePricesDTO | UpdatePricesDTO)[];
    }[];
    /**
     * The IDs of the variants to remove all their prices.
     */
    previousVariantIds: string[];
};
export declare const upsertVariantPricesWorkflowId = "upsert-variant-prices";
/**
 * This workflow creates, updates, or removes variants' prices. It's used by the {@link updateProductsWorkflow}
 * when updating a variant's prices.
 *
 * You can use this workflow within your own customizations or custom workflows to manage the prices of a variant.
 *
 * @example
 * const { result } = await upsertVariantPricesWorkflow(container)
 * .run({
 *   input: {
 *     variantPrices: [
 *       {
 *         variant_id: "variant_123",
 *         product_id: "prod_123",
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd",
 *           },
 *           {
 *             id: "price_123",
 *             amount: 20,
 *           }
 *         ]
 *       }
 *     ],
 *     // these are variants to remove all their prices
 *     // typically used when a variant is deleted.
 *     previousVariantIds: ["variant_321"]
 *   }
 * })
 *
 * @summary
 *
 * Create, update, or remove variants' prices.
 */
export declare const upsertVariantPricesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpsertVariantPricesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=upsert-variant-prices.d.ts.map