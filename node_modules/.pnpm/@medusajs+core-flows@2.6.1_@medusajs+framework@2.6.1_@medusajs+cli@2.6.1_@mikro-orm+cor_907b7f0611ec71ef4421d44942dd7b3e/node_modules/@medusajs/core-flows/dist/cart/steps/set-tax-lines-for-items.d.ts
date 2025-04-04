import { CartWorkflowDTO, ItemTaxLineDTO, ShippingTaxLineDTO } from "@medusajs/framework/types";
/**
 * The details of the tax lines to set in a cart.
 */
export interface SetTaxLinesForItemsStepInput {
    /**
     * The cart's details.
     */
    cart: CartWorkflowDTO;
    /**
     * The tax lines to set for line items.
     */
    item_tax_lines: ItemTaxLineDTO[];
    /**
     * The tax lines to set for shipping methods.
     */
    shipping_tax_lines: ShippingTaxLineDTO[];
}
export declare const setTaxLinesForItemsStepId = "set-tax-lines-for-items";
/**
 * This step sets the tax lines of shipping methods and line items in a cart.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = setTaxLinesForItemsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   "item_tax_lines": [{
 *     "rate": 48,
 *     "code": "CODE123",
 *     "name": "Tax rate 2",
 *     "provider_id": "provider_1",
 *     "line_item_id": "litem_123"
 *   }],
 *   "shipping_tax_lines": [{
 *     "rate": 49,
 *     "code": "CODE456",
 *     "name": "Tax rate 1",
 *     "provider_id": "provider_1",
 *     "shipping_line_id": "sm_123"
 *   }]
 * })
 */
export declare const setTaxLinesForItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetTaxLinesForItemsStepInput, null>;
//# sourceMappingURL=set-tax-lines-for-items.d.ts.map