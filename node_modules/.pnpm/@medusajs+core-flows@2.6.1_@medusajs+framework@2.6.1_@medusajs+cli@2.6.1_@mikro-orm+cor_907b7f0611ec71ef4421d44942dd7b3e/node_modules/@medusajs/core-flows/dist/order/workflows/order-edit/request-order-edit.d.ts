import { OrderChangeDTO, OrderDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that an order edit can be requested.
 */
export type RequestOrderEditRequestValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that a order edit can be requested.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = requestOrderEditRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 * })
 */
export declare const requestOrderEditRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RequestOrderEditRequestValidationStepInput, unknown>;
/**
 * The data to request an order edit.
 */
export type OrderEditRequestWorkflowInput = {
    /**
     * The ID of the order to request the edit for.
     */
    order_id: string;
    /**
     * The ID of the user requesting the edit.
     */
    requested_by?: string;
};
export declare const requestOrderEditRequestWorkflowId = "order-edit-request";
/**
 * This workflow requests a previously created order edit request by {@link beginOrderEditOrderWorkflow}. This workflow is used by
 * the [Request Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await requestOrderEditRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Request an order edit.
 */
export declare const requestOrderEditRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderEditRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=request-order-edit.d.ts.map