import { OrderChangeDTO, UpdateOrderChangeActionDTO } from "@medusajs/framework/types";
export declare const updateOrderChangesWorkflowId = "update-order-change";
/**
 * This workflow updates one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order changes.
 *
 * @summary
 *
 * Update one or more order changes.
 */
export declare const updateOrderChangesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateOrderChangeActionDTO[], OrderChangeDTO[], []>;
//# sourceMappingURL=update-order-changes.d.ts.map