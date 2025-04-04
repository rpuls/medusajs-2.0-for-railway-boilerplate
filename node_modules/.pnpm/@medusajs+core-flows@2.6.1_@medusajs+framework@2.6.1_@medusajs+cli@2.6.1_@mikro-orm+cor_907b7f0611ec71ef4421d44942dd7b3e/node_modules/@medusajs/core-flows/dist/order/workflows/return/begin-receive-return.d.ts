import { OrderChangeDTO, OrderDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return can be received.
 */
export type BeginReceiveReturnValidationStepInput = {
    /**
     * The order return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order's details.
     */
    order: OrderDTO;
};
/**
 * This step validates that a return can be received.
 * If the order or return is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginReceiveReturnValidationStep({
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
export declare const beginReceiveReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<BeginReceiveReturnValidationStepInput, unknown>;
export declare const beginReceiveReturnWorkflowId = "begin-receive-return";
/**
 * This workflow requests return receival. It's used by the
 * [Start Return Receival Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceive).
 *
 * You can confirm the return receival using the {@link confirmReturnRequestWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to receive a return in your custom flows.
 *
 * @example
 * const { result } = await beginReceiveReturnWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Request a return receival.
 */
export declare const beginReceiveReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginReceiveOrderReturnWorkflowInput, OrderChangeDTO, []>;
//# sourceMappingURL=begin-receive-return.d.ts.map