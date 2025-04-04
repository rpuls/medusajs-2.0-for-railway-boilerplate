/**
 * The data to delete customer groups.
 */
export type DeleteCustomerGroupsWorkflowInput = {
    /**
     * The IDs of the customer groups to delete.
     */
    ids: string[];
};
export declare const deleteCustomerGroupsWorkflowId = "delete-customer-groups";
/**
 * This workflow deletes one or more customer groups. It's used by the
 * [Delete Customer Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_deletecustomergroupsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete customer groups within your custom flows.
 *
 * @example
 * const { result } = await deleteCustomerGroupsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["cusgrp_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more customer groups.
 */
export declare const deleteCustomerGroupsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteCustomerGroupsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-customer-groups.d.ts.map