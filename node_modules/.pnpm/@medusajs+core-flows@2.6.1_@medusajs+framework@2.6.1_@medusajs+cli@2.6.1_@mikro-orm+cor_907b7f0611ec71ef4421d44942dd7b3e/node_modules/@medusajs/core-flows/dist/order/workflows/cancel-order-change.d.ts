import { CancelOrderChangeDTO } from "@medusajs/framework/types";
export declare const cancelOrderChangeWorkflowId = "cancel-order-change";
/**
 * This workflow cancels an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * canceling an order change.
 *
 * @summary
 *
 * Cancel an order change.
 */
export declare const cancelOrderChangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelOrderChangeDTO, unknown, any[]>;
//# sourceMappingURL=cancel-order-change.d.ts.map