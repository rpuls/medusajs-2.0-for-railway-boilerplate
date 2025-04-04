import { CartLineItemDTO, CartShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The details of the cart to upsert tax lines for.
 */
export type UpsertTaxLinesWorkflowInput = {
    /**
     * The cart's ID.
     */
    cart_id?: string;
    /**
     * The Cart reference.
     */
    cart?: any;
    /**
     * The items to upsert their tax lines.
     * If not specified, taxes are upsertd for all of the cart's
     * line items.
     */
    items: CartLineItemDTO[];
    /**
     * The shipping methods to upsert their tax lines.
     * If not specified, taxes are upsertd for all of the cart's
     * shipping methods.
     */
    shipping_methods: CartShippingMethodDTO[];
    /**
     * Whether to force re-calculating tax amounts, which
     * may include sending requests to a third-part tax provider, depending
     * on the configurations of the cart's tax region.
     *
     * @defaultValue false
     */
    force_tax_calculation?: boolean;
};
export declare const upsertTaxLinesWorkflowId = "upsert-tax-lines";
/**
 * This workflow upserts a cart's tax lines that are applied on line items and shipping methods. You can upsert the line item's quantity, unit price, and more. This workflow is executed
 * by the [Calculate Taxes Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidtaxes).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to upsert a cart's tax lines in your custom flows.
 *
 * @example
 * const { result } = await upsertTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *    items: [],
 *    shipping_methods: [],
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's tax lines.
 */
export declare const upsertTaxLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpsertTaxLinesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=upsert-tax-lines.d.ts.map