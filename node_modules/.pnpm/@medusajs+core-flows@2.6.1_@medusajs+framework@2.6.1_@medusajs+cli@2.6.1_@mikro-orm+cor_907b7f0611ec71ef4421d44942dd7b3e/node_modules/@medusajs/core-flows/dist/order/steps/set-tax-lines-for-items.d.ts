import { ItemTaxLineDTO, OrderDTO, ShippingTaxLineDTO } from "@medusajs/framework/types";
/**
 * The details of setting tax lines for an order's items and shipping methods.
 */
export interface SetOrderTaxLinesForItemsStepInput {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The tax lines to set for the order's items.
     */
    item_tax_lines: ItemTaxLineDTO[];
    /**
     * The tax lines to set for the order's shipping methods.
     */
    shipping_tax_lines: ShippingTaxLineDTO[];
}
export declare const setOrderTaxLinesForItemsStepId = "set-order-tax-lines-for-items";
/**
 * This step sets the tax lines of an order's items and shipping methods.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = setOrderTaxLinesForItemsStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   item_tax_lines: [
 *     {
 *       line_item_id: "orli_123",
 *       rate: 0.25,
 *       code: "VAT",
 *       name: "VAT",
 *       provider_id: "tax_provider_123",
 *     }
 *   ]
 * })
 */
export declare const setOrderTaxLinesForItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetOrderTaxLinesForItemsStepInput, undefined>;
//# sourceMappingURL=set-tax-lines-for-items.d.ts.map