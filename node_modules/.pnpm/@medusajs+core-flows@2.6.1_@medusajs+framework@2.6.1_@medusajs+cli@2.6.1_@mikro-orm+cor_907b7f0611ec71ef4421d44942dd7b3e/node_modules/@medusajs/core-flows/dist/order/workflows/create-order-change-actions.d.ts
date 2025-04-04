import { CreateOrderChangeActionDTO, OrderChangeActionDTO } from "@medusajs/framework/types";
export declare const createOrderChangeActionsWorkflowId = "create-order-change-actions";
/**
 * This workflow creates order change actions. It's used by other order-related workflows,
 * such as {@link requestItemReturnWorkflow} to create an order change action based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change action.
 *
 * @summary
 *
 * Create an order change action.
 */
export declare const createOrderChangeActionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderChangeActionDTO[], OrderChangeActionDTO[], []>;
//# sourceMappingURL=create-order-change-actions.d.ts.map