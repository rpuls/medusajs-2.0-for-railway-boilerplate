import { OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that items can be returned as part of an exchange.
 */
export type ExchangeRequestItemReturnValidationStepInput = {
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
     * The order return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The items to be returned.
     */
    items: OrderWorkflow.OrderExchangeRequestItemReturnWorkflowInput["items"];
};
/**
 * This step validates that items can be returned as part of an exchange.
 * If the order, exchange, or return is canceled, the order change is not active,
 * or the item doesn't exist in the order, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order exchange, and order return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = exchangeRequestItemReturnValidationStep({
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
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
export declare const exchangeRequestItemReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ExchangeRequestItemReturnValidationStepInput, unknown>;
export declare const orderExchangeRequestItemReturnWorkflowId = "exchange-request-item-return";
/**
 * This workflow adds inbound items to be retuned as part of the exchange. It's used
 * by the [Add Inbound Items Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidinbounditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add inbound items
 * to be returned as part of an exchange in your custom flow.
 *
 * @example
 * const { result } = await orderExchangeRequestItemReturnWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
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
 * Add inbound items to be returned as part of the exchange.
 */
export declare const orderExchangeRequestItemReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderExchangeRequestItemReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=exchange-request-item-return.d.ts.map