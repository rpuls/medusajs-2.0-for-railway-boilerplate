import { FulfillmentDTO, OrderDTO } from "@medusajs/framework/types";
/**
 * The data to validate the order fulfillment deliverability.
 */
export type OrderFulfillmentDeliverabilityValidationStepInput = {
    /**
     * The order to validate the fulfillment deliverability for.
     */
    order: OrderDTO & {
        /**
         * The fulfillments in the order.
         */
        fulfillments: FulfillmentDTO[];
    };
    /**
     * The fulfillment to validate the deliverability for.
     */
    fulfillment: FulfillmentDTO;
};
export declare const orderFulfillmentDeliverablilityValidationStepId = "order-fulfillment-deliverability-validation";
/**
 * This step validates that the order fulfillment can be delivered. If the order is cancelled,
 * the items to mark as delivered don't exist in the order, or the fulfillment doesn't exist in the order,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and fulfillment's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderFulfillmentDeliverablilityValidationStep({
 *   order: {
 *     id: "order_123",
 *     fulfillments: [
 *       {
 *         id: "ful_123",
 *         // other fulfillment details...
 *       }
 *     ]
 *     // other order details...
 *   },
 *   fulfillment: {
 *     id: "ful_123",
 *     // other fulfillment details...
 *   }
 * })
 */
export declare const orderFulfillmentDeliverablilityValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO & {
        fulfillments: FulfillmentDTO[];
    };
    fulfillment: FulfillmentDTO;
}, unknown>;
/**
 * The details to mark a fulfillment in an order as delivered.
 */
export type MarkOrderFulfillmentAsDeliveredWorkflowInput = {
    /**
     * The ID of the order to mark the fulfillment as delivered in.
     */
    orderId: string;
    /**
     * The ID of the fulfillment to mark as delivered.
     */
    fulfillmentId: string;
};
export declare const markOrderFulfillmentAsDeliveredWorkflowId = "mark-order-fulfillment-as-delivered-workflow";
/**
 * This workflow marks a fulfillment in an order as delivered. It's used by the
 * [Mark Fulfillment as Delivered Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidfulfillmentsfulfillment_idmarkasdelivered).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * marking a fulfillment as delivered.
 *
 * @example
 * const { result } = await markOrderFulfillmentAsDeliveredWorkflow(container)
 * .run({
 *   input: {
 *     orderId: "order_123",
 *     fulfillmentId: "ful_123",
 *   }
 * })
 *
 * @summary
 *
 * Mark a fulfillment in an order as delivered.
 */
export declare const markOrderFulfillmentAsDeliveredWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<MarkOrderFulfillmentAsDeliveredWorkflowInput, undefined, []>;
//# sourceMappingURL=mark-order-fulfillment-as-delivered.d.ts.map