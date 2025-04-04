import { OrderChangeActionDTO, UpdateOrderChangeActionDTO } from "@medusajs/framework/types";
export declare const updateOrderChangeActionsWorkflowId = "update-order-change-actions";
/**
 * This workflow updates one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order change actions.
 *
 * @summary
 *
 * Update one or more order change actions.
 */
export declare const updateOrderChangeActionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateOrderChangeActionDTO[], OrderChangeActionDTO[], []>;
//# sourceMappingURL=update-order-change-actions.d.ts.map