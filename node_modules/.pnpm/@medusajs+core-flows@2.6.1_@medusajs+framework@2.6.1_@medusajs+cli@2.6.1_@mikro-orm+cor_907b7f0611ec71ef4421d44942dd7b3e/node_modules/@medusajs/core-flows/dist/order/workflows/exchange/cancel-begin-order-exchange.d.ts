import { OrderChangeDTO, OrderDTO, OrderExchangeDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a requested exchange can be canceled.
 */
export type CancelBeginOrderExchangeValidationStepInput = {
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
 * This step validates that a requested exchange can be canceled.
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
 * const data = cancelBeginOrderExchangeValidationStep({
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
export declare const cancelBeginOrderExchangeValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelBeginOrderExchangeValidationStepInput, unknown>;
/**
 * The details to cancel a requested order exchange.
 */
export type CancelBeginOrderExchangeWorkflowInput = {
    /**
     * The ID of the exchange to cancel.
     */
    exchange_id: string;
};
export declare const cancelBeginOrderExchangeWorkflowId = "cancel-begin-order-exchange";
/**
 * This workflow cancels a requested order exchange. It's used by the
 * [Cancel Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to cancel an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await cancelBeginOrderExchangeWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a requested order exchange.
 */
export declare const cancelBeginOrderExchangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelBeginOrderExchangeWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-begin-order-exchange.d.ts.map