import { OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a requested exchange can be confirmed.
 */
export type ConfirmExchangeRequestValidationStepInput = {
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
 * This step validates that a requested exchange can be confirmed.
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
 * const data = confirmExchangeRequestValidationStep({
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
export declare const confirmExchangeRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmExchangeRequestValidationStepInput, unknown>;
/**
 * The details to confirm an exchange request.
 */
export type ConfirmExchangeRequestWorkflowInput = {
    /**
     * The ID of the exchange to confirm.
     */
    exchange_id: string;
    /**
     * The ID of the user that's confirming the exchange.
     */
    confirmed_by?: string;
};
export declare const confirmExchangeRequestWorkflowId = "confirm-exchange-request";
/**
 * This workflow confirms an exchange request. It's used by the
 * [Confirm Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await confirmExchangeRequestWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm an exchange request.
 */
export declare const confirmExchangeRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmExchangeRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-exchange-request.d.ts.map