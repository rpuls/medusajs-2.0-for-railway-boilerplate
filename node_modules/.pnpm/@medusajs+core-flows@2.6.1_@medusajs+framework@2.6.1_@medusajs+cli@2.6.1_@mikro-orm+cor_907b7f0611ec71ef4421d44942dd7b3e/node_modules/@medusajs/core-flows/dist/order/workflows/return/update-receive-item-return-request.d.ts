import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that an item can be updated in a return receival request.
 */
export type UpdateReceiveItemReturnRequestValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the item update.
     */
    input: OrderWorkflow.UpdateReceiveItemReturnRequestWorkflowInput;
};
/**
 * This step validates that an item can be updated in a return receival request.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found, or the action is not receiving an item return request,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateReceiveItemReturnRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         // other item details...
 *       }
 *     ]
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 */
export declare const updateReceiveItemReturnRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReceiveItemReturnRequestValidationStepInput, unknown>;
export declare const updateReceiveItemReturnRequestWorkflowId = "update-receive-item-return-request";
/**
 * This workflow updates an item in a return receival request. It's used by the
 * [Update a Received Item in a Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceiveitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an item in a return receival request
 * in your custom flows.
 *
 * @example
 * const { result } = await updateReceiveItemReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an item in a return receival request.
 */
export declare const updateReceiveItemReturnRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateReceiveItemReturnRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-receive-item-return-request.d.ts.map