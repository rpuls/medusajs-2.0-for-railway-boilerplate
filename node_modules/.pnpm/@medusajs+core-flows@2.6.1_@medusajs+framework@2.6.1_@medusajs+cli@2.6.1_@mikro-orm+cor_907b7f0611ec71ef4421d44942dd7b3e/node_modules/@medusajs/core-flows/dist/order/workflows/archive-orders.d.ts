import { OrderDTO } from "@medusajs/framework/types";
/**
 * The details of the orders to archive.
 */
export type ArchiveOrdersWorkflowInput = {
    /**
     * The IDs of the orders to archive.
     */
    orderIds: string[];
};
/**
 * The archived orders.
 */
export type ArchiveOrdersWorkflowOutput = OrderDTO[];
export declare const archiveOrderWorkflowId = "archive-order-workflow";
/**
 * This workflow archives one or more orders. It's used by the
 * [Archive Order Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidarchive).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around archiving orders.
 *
 * @example
 * const { result } = await archiveOrderWorkflow(container)
 * .run({
 *   input: {
 *     orderIds: ["order_123"]
 *   }
 * })
 *
 * @summary
 *
 * Archive one or more orders.
 */
export declare const archiveOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ArchiveOrdersWorkflowInput, ArchiveOrdersWorkflowOutput, []>;
//# sourceMappingURL=archive-orders.d.ts.map