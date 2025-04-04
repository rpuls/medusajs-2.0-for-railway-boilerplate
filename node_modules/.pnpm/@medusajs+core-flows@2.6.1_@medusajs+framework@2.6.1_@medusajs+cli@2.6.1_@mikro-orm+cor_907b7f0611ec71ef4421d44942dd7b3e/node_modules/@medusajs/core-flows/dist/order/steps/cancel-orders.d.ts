/**
 * The details of canceling the orders.
 */
export type CancelOrdersStepInput = {
    /**
     * The IDs of the orders to cancel.
     */
    orderIds: string[];
    /**
     * The ID of the user canceling the orders.
     */
    canceled_by?: string;
};
export declare const cancelOrdersStepId = "cancel-orders";
/**
 * This step cancels one or more orders.
 */
export declare const cancelOrdersStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelOrdersStepInput, import("@medusajs/framework/types").OrderDTO[]>;
//# sourceMappingURL=cancel-orders.d.ts.map