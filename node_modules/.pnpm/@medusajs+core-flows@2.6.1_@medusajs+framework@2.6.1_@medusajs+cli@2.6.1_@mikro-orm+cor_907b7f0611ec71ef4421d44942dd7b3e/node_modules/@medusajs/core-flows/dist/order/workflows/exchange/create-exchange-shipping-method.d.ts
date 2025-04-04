import { BigNumberInput, OrderChangeDTO, OrderDTO, OrderExchangeDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be created for an exchange.
 */
export type CreateExchangeShippingMethodValidationStepInput = {
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
 * This step validates that an inbound or outbound shipping method can be created for an exchange.
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
 * const data = createExchangeShippingMethodValidationStep({
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
export declare const createExchangeShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateExchangeShippingMethodValidationStepInput, unknown>;
/**
 * The details to create the shipping method for the exchange.
 */
export type CreateExchangeShippingMethodWorkflowInput = {
    /**
     * The ID of the return associated with the exchange.
     * If set, an inbound shipping method will be created for the return.
     * If not set, an outbound shipping method will be created for the exchange.
     */
    return_id?: string;
    /**
     * The ID of the exchange to create the shipping method for.
     */
    exchange_id?: string;
    /**
     * The ID of the shipping option to create the shipping method from.
     */
    shipping_option_id: string;
    /**
     * The custom amount to charge for the shipping method.
     * If not set, the shipping option's amount is used.
     */
    custom_amount?: BigNumberInput | null;
};
export declare const createExchangeShippingMethodWorkflowId = "create-exchange-shipping-method";
/**
 * This workflow creates an inbound (return) or outbound (delivery of new items) shipping method for an exchange.
 * It's used by the [Add Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidinboundshippingmethod)
 * and the [Add Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidoutboundshippingmethod).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a shipping method
 * for an exchange in your custom flow.
 *
 * @example
 * To create an outbound shipping method for the exchange:
 *
 * ```ts
 * const { result } = await createExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     shipping_option_id: "so_123"
 *   }
 * })
 * ```
 *
 * To create an inbound shipping method, pass the ID of the return associated with the exchange:
 *
 * ```ts
 * const { result } = await createExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     return_id: "return_123",
 *     shipping_option_id: "so_123"
 *   }
 * })
 * ```
 *
 * @summary
 *
 * Create an inbound or outbound shipping method for an exchange.
 */
export declare const createExchangeShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateExchangeShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=create-exchange-shipping-method.d.ts.map