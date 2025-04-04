/**
 * The data to associate products with sales channels.
 */
export interface AssociateProductsWithSalesChannelsStepInput {
    /**
     * The links to create between products and sales channels.
     */
    links: {
        /**
         * The ID of the sales channel.
         */
        sales_channel_id: string;
        /**
         * The ID of the product.
         */
        product_id: string;
    }[];
}
export declare const associateProductsWithSalesChannelsStepId = "associate-products-with-channels";
/**
 * This step creates links between products and sales channel records.
 *
 * @example
 * const data = associateProductsWithSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       product_id: "prod_123"
 *     }
 *   ]
 * })
 */
export declare const associateProductsWithSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<AssociateProductsWithSalesChannelsStepInput, unknown[]>;
//# sourceMappingURL=associate-products-with-channels.d.ts.map