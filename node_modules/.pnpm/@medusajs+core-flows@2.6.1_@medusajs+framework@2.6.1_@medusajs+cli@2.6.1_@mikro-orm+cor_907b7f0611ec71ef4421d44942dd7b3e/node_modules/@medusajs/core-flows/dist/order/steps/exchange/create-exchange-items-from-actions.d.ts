import { OrderChangeActionDTO } from "@medusajs/framework/types";
/**
 * The details of creating exchange items from change actions.
 */
export type CreateOrderExchangeItemsFromActionsInput = {
    /**
     * The change actions to create exchange items from.
     */
    changes: OrderChangeActionDTO[];
    /**
     * The ID of the exchange to create the items for.
     */
    exchangeId: string;
};
/**
 * This step creates exchange items from change actions.
 *
 * :::note
 *
 * You can retrieve an order change action details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createOrderExchangeItemsFromActionsStep({
 *   exchangeId: "exchange_123",
 *   changes: [
 *     {
 *       id: "orchact_123",
 *       // other order change action details...
 *     }
 *   ]
 * })
 */
export declare const createOrderExchangeItemsFromActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderExchangeItemsFromActionsInput, import("@medusajs/framework/types").OrderExchangeItemDTO[]>;
//# sourceMappingURL=create-exchange-items-from-actions.d.ts.map