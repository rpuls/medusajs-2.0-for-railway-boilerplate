import { CreateOrderChangeDTO, OrderChangeDTO } from "@medusajs/framework/types";
export declare const createOrderChangeWorkflowId = "create-order-change";
/**
 * This workflow creates an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change.
 *
 * @summary
 *
 * Create an order change.
 */
export declare const createOrderChangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateOrderChangeDTO, OrderChangeDTO, []>;
//# sourceMappingURL=create-order-change.d.ts.map