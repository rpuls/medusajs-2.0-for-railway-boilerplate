import { OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { OrderPreviewDTO } from "@medusajs/types";
/**
 * The data to validate the order update.
 */
export type UpdateOrderValidationStepInput = {
    /**
     * The order to validate the update for.
     */
    order: OrderDTO;
    /**
     * The order update details.
     */
    input: OrderWorkflow.UpdateOrderWorkflowInput;
};
/**
 * This step validates that an order can be updated with provided input. If the order is cancelled,
 * the email is invalid, or the country code is being changed in the shipping or billing addresses, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateOrderValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   input: {
 *     id: "order_123",
 *     user_id: "user_123"
 *   }
 * })
 */
export declare const updateOrderValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderValidationStepInput, unknown>;
export declare const updateOrderWorkflowId = "update-order-workflow";
/**
 * This workflow updates an order's general details, such as its email or addresses. It's used by the
 * [Update Order Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an
 * order's details in your custom flows.
 *
 * @example
 * const { result } = await updateOrderWorkflow(container)
 * .run({
 *   input: {
 *     id: "order_123",
 *     user_id: "user_123",
 *     email: "example@gmail.com",
 *   }
 * })
 *
 * @summary
 *
 * Update an order's details.
 */
export declare const updateOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-order.d.ts.map