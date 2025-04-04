/**
 * The details of the line items to validate.
 */
export interface ValidateLineItemPricesStepInput {
    /**
     * The line items to validate.
     */
    items: {
        /**
         * The price of the line item.
         */
        unit_price?: number | null;
        /**
         * The title of the line item.
         */
        title: string;
    }[];
}
export declare const validateLineItemPricesStepId = "validate-line-item-prices";
/**
 * This step validates the specified line item objects to ensure they have prices.
 * If an item doesn't have a price, the step throws an error.
 *
 * @example
 * const data = validateLineItemPricesStep({
 *   items: [
 *     {
 *       unit_price: 10,
 *       title: "Shirt"
 *     },
 *     {
 *       title: "Pants"
 *     }
 *   ]
 * })
 */
export declare const validateLineItemPricesStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateLineItemPricesStepInput, unknown>;
//# sourceMappingURL=validate-line-item-prices.d.ts.map