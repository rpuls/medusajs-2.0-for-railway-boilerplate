/**
 * The data to detach products from sales channels.
 */
export interface DetachProductsFromSalesChannelsStepInput {
    /**
     * The links to dismiss between products and sales channels.
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
export declare const detachProductsFromSalesChannelsStepId = "detach-products-from-sales-channels-step";
/**
 * This step dismisses links between product and sales channel records.
 *
 * @example
 * const data = detachProductsFromSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       product_id: "prod_123"
 *     }
 *   ]
 * })
 */
export declare const detachProductsFromSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DetachProductsFromSalesChannelsStepInput, undefined>;
//# sourceMappingURL=detach-products-from-sales-channels.d.ts.map