import { OrderWorkflowDTO } from "@medusajs/framework/types";
/**
 * The data to update the order's tax lines.
 */
export type UpdateOrderTaxLinesWorkflowInput = {
    /**
     * The ID of the order to update.
     */
    order_id: string;
    /**
     * The IDs of the items to update the tax lines for.
     */
    item_ids?: string[];
    /**
     * The IDs of the shipping methods to update the tax lines for.
     */
    shipping_method_ids?: string[];
    /**
     * Whether to force the tax calculation. If enabled, the tax provider
     * may send request to a third-party service to retrieve the calculated
     * tax rates. This depends on the chosen tax provider in the order's tax region.
     */
    force_tax_calculation?: boolean;
    /**
     * Whether to calculate the tax lines for a return.
     */
    is_return?: boolean;
    /**
     * The shipping address to use for the tax calculation.
     */
    shipping_address?: OrderWorkflowDTO["shipping_address"];
};
export declare const updateOrderTaxLinesWorkflowId = "update-order-tax-lines";
/**
 * This workflow updates the tax lines of items and shipping methods in an order. It's used by
 * other order-related workflows, such as the {@link createOrderWorkflow} to set the order's
 * tax lines.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an
 * order's tax lines in your custom flows.
 *
 * @example
 * const { result } = await updateOrderTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     item_ids: ["orli_123", "orli_456"],
 *   }
 * })
 *
 * @summary
 *
 * Update the tax lines of items and shipping methods in an order.
 */
export declare const updateOrderTaxLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateOrderTaxLinesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=update-tax-lines.d.ts.map