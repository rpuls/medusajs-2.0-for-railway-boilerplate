import { OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an outbound or new item in an exchange can be updated.
 */
export type UpdateExchangeAddItemValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order exchange's details.
     */
    orderExchange: OrderExchangeDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the item update.
     */
    input: OrderWorkflow.UpdateExchangeAddNewItemWorkflowInput;
};
/**
 * This step validates that an outbound or new item can be removed from an exchange.
 * If the order or exchange is canceled, the item is not found in the exchange,
 * or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order exchange, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateExchangeAddItemValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       quantity: 1
 *     }
 *   }
 * })
 */
export declare const updateExchangeAddItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateExchangeAddItemValidationStepInput, unknown>;
export declare const updateExchangeAddItemWorkflowId = "update-exchange-add-item";
/**
 * This workflow updates an outbound or new item in the exchange. It's used by the
 * [Update Outbound Item Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidoutbounditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an outbound or new item
 * in an exchange in your custom flow.
 *
 * @example
 * const { result } = await updateExchangeAddItemWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *     data: {
 *       quantity: 1
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an outbound or new item in an exchange.
 */
export declare const updateExchangeAddItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateExchangeAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-exchange-add-item.d.ts.map