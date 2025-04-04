import { CartLineItemDTO, CartShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The details of the cart to update tax lines for.
 */
export type UpdateTaxLinesWorkflowInput = {
    /**
     * The cart's ID.
     */
    cart_id?: string;
    /**
     * The Cart reference.
     */
    cart?: any;
    /**
     * The items to update their tax lines.
     * If not specified, taxes are updated for all of the cart's
     * line items.
     *
     * @privateRemarks
     * This doesn't seem to be used?
     */
    items?: CartLineItemDTO[];
    /**
     * The shipping methods to update their tax lines.
     * If not specified, taxes are updated for all of the cart's
     * shipping methods.
     *
     * @privateRemarks
     * This doesn't seem to be used?
     */
    shipping_methods?: CartShippingMethodDTO[];
    /**
     * Whether to force re-calculating tax amounts, which
     * may include sending requests to a third-part tax provider, depending
     * on the configurations of the cart's tax region.
     *
     * @defaultValue false
     */
    force_tax_calculation?: boolean;
};
export declare const updateTaxLinesWorkflowId = "update-tax-lines";
/**
 * This workflow updates a cart's tax lines that are applied on line items and shipping methods. You can update the line item's quantity, unit price, and more. This workflow is executed
 * by the [Calculate Taxes Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidtaxes).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a cart's tax lines in your custom flows.
 *
 * @example
 * const { result } = await updateTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's tax lines.
 */
export declare const updateTaxLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateTaxLinesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=update-tax-lines.d.ts.map