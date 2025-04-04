import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that an item in a return can be updated.
 */
export type UpdateRequestItemReturnValidationStepInput = {
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
     * The details of updating the item.
     */
    input: OrderWorkflow.UpdateRequestItemReturnWorkflowInput;
};
/**
 * This step validates that an item in a return can be updated.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found, or the action is not requesting an item return,
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
 * const data = updateRequestItemReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
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
export declare const updateRequestItemReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateRequestItemReturnValidationStepInput, unknown>;
export declare const updateRequestItemReturnWorkflowId = "update-request-item-return";
/**
 * This workflow updates a requested item in a return. It's used by the
 * [Update Requested Item in Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidrequestitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an
 * item in a return in your custom flows.
 *
 * @example
 * const { result } = await updateRequestItemReturnWorkflow(container)
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
 * Update a requested item in a return.
 */
export declare const updateRequestItemReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateRequestItemReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-request-item-return.d.ts.map