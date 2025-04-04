import { CartLineItemDTO, CartShippingMethodDTO, CartWorkflowDTO, ItemTaxLineDTO, OrderLineItemDTO, OrderShippingMethodDTO, OrderWorkflowDTO, ShippingTaxLineDTO } from "@medusajs/framework/types";
/**
 * The data to retrieve tax lines for an order or cart's line items and shipping methods.
 */
export interface GetItemTaxLinesStepInput {
    /**
     * The order or cart details.
     */
    orderOrCart: OrderWorkflowDTO | CartWorkflowDTO;
    /**
     * The order or cart's items.
     */
    items: OrderLineItemDTO[] | CartLineItemDTO[];
    /**
     * The order or cart's shipping methods.
     */
    shipping_methods: OrderShippingMethodDTO[] | CartShippingMethodDTO[];
    /**
     * Whether to re-calculate taxes. Enabling this may require sending
     * requests to third-party services, depending on the implementation of the
     * tax provider associated with the cart or order's region.
     */
    force_tax_calculation?: boolean;
    /**
     * Whether the tax lines are for an order return.
     */
    is_return?: boolean;
    /**
     * The shipping address of the order.
     */
    shipping_address?: OrderWorkflowDTO["shipping_address"];
}
export declare const getItemTaxLinesStepId = "get-item-tax-lines";
/**
 * This step retrieves the tax lines for an order or cart's line items and shipping methods.
 *
 * :::note
 *
 * You can retrieve an order, cart, item, shipping method, and address details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = getItemTaxLinesStep({
 *   orderOrCart: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       // other order item details...
 *     }
 *   ],
 *   shipping_methods: [
 *     {
 *       id: "osm_213",
 *       // other shipping method details...
 *     }
 *   ],
 * })
 */
export declare const getItemTaxLinesStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetItemTaxLinesStepInput, {
    lineItemTaxLines: ItemTaxLineDTO[];
    shippingMethodsTaxLines: ShippingTaxLineDTO[];
}>;
//# sourceMappingURL=get-item-tax-lines.d.ts.map