import { OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that new or outbound items can be added to an exchange.
 */
export type ExchangeAddNewItemValidationStepInput = {
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
};
/**
 * This step validates that new or outbound items can be added to an exchange.
 * If the order or exchange is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order exchange, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = exchangeAddNewItemValidationStep({
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
 * })
 */
export declare const exchangeAddNewItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ExchangeAddNewItemValidationStepInput, unknown>;
export declare const orderExchangeAddNewItemWorkflowId = "exchange-add-new-item";
/**
 * This workflow adds new or outbound items to an exchange. It's used by the
 * [Add Outbound Items Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidoutbounditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add new or outbound items
 * to an exchange in your custom flow.
 *
 * @example
 * const { result } = await orderExchangeAddNewItemWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add new or outbound items to an exchange.
 */
export declare const orderExchangeAddNewItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderExchangeAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=exchange-add-new-item.d.ts.map