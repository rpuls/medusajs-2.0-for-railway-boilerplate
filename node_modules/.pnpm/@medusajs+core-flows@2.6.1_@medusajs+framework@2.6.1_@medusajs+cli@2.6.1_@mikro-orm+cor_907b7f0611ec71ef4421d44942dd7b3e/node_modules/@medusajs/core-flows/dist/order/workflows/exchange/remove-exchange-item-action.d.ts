import { OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an outbound item can be removed from an exchange.
 */
export type RemoveExchangeItemActionValidationStepInput = {
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
     * The details of the item to remove.
     */
    input: OrderWorkflow.DeleteOrderExchangeItemActionWorkflowInput;
};
/**
 * This step validates that an outbound item can be removed from an exchange.
 * If the order or exchange is canceled, the item is not found,
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
 * const data = removeExchangeItemActionValidationStep({
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
 *   }
 * })
 *
 */
export declare const removeExchangeItemActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveExchangeItemActionValidationStepInput, unknown>;
export declare const removeItemExchangeActionWorkflowId = "remove-item-exchange-action";
/**
 * This workflow removes an outbound or new item from an exchange. It's used by
 * the [Remove Outbound Item API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidoutbounditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an outbound or new item
 * from an exchange in your custom flow.
 *
 * @example
 * const { result } = await removeItemExchangeActionWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an outbound or new item from an exchange.
 */
export declare const removeItemExchangeActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderExchangeItemActionWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-exchange-item-action.d.ts.map