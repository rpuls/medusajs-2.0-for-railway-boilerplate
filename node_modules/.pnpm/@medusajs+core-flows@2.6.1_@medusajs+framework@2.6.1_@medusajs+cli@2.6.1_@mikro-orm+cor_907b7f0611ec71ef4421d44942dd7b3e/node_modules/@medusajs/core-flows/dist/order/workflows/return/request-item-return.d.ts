import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that items can be added to a return.
 */
export type RequestItemReturnValidationStepInput = {
    /**
     * The order's details.
     */
    order: Pick<OrderDTO, "id" | "items">;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The items to be added to the return.
     */
    items: OrderWorkflow.RequestItemReturnWorkflowInput["items"];
};
/**
 * This step validates that items can be added to a return.
 * If the order or return is canceled, the order change is not active,
 * the items do not exist in the order, or the return reasons are invalid,
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
 * const data = requestItemReturnValidationStep({
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
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
export declare const requestItemReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RequestItemReturnValidationStepInput, unknown>;
export declare const requestItemReturnWorkflowId = "request-item-return";
/**
 * This workflow adds items to a return. It's used by the
 * [Add Requested Items to Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidrequestitems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add items to a return
 * in your custom flows.
 *
 * @example
 * const { result } = await requestItemReturnWorkflow(container)
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
 * Add items to a return.
 */
export declare const requestItemReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.RequestItemReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=request-item-return.d.ts.map