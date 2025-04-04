import { DeclineOrderChangeDTO } from "@medusajs/framework/types";
export declare const declineOrderChangeWorkflowId = "decline-order-change";
/**
 * This workflow declines an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * declining an order change.
 *
 * @summary
 *
 * Decline an order change.
 */
export declare const declineOrderChangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeclineOrderChangeDTO, unknown, any[]>;
//# sourceMappingURL=decline-order-change.d.ts.map