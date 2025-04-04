import { OrderWorkflow } from "@medusajs/framework/types";
import { ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return can be received and completed.
 */
export type ReceiveCompleteReturnValidationStepInput = {
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The details of receiving and completing the return.
     */
    input: OrderWorkflow.ReceiveCompleteOrderReturnWorkflowInput;
};
/**
 * This step validates that a return can be received and completed.
 * If the return is canceled or the items do not exist in the return, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = receiveCompleteReturnValidationStep({
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 */
export declare const receiveCompleteReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ReceiveCompleteReturnValidationStepInput, unknown>;
export declare const receiveAndCompleteReturnOrderWorkflowId = "receive-return-order";
/**
 * This workflow marks a return as received and completes it.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to receive and complete a return.
 *
 * @example
 * const { result } = await receiveAndCompleteReturnOrderWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Receive and complete a return.
 */
export declare const receiveAndCompleteReturnOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.ReceiveCompleteOrderReturnWorkflowInput, ReturnDTO | undefined, []>;
//# sourceMappingURL=receive-complete-return.d.ts.map