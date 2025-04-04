import { CreateOrderLineItemDTO } from "@medusajs/framework/types";
/**
 * The details of creating order line items.
 */
export interface CreateOrderLineItemsStepInput {
    /**
     * The items to create.
     */
    items: CreateOrderLineItemDTO[];
}
export declare const createOrderLineItemsStepId = "create-order-line-items-step";
/**
 * This step creates order line items.
 *
 * @example
 * const data = createOrderLineItemsStep({
 *   items: [
 *     {
 *       variant_id: "variant_123",
 *       quantity: 1,
 *       unit_price: 10,
 *       title: "Shirt",
 *       order_id: "order_123"
 *     }
 *   ]
 * })
 */
export declare const createOrderLineItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderLineItemsStepInput, import("@medusajs/framework/types").OrderLineItemDTO[]>;
//# sourceMappingURL=create-line-items.d.ts.map