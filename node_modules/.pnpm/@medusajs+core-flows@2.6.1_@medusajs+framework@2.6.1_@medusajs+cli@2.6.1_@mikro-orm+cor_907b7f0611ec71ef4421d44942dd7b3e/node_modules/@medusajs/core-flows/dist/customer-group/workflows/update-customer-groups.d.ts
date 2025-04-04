import { CustomerGroupDTO, FilterableCustomerGroupProps, CustomerGroupUpdatableFields } from "@medusajs/framework/types";
/**
 * The data to update customer groups.
 */
export type UpdateCustomerGroupsWorkflowInput = {
    /**
     * The filter to select the customer groups to update.
     */
    selector: FilterableCustomerGroupProps;
    /**
     * The data to update in the customer group.
     */
    update: CustomerGroupUpdatableFields;
};
/**
 * The updated customer groups.
 */
export type UpdateCustomerGroupsWorkflowOutput = CustomerGroupDTO[];
export declare const updateCustomerGroupsWorkflowId = "update-customer-groups";
/**
 * This workflow updates one or more customer groups. It's used by the
 * [Update Customer Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update customer groups within your custom flows.
 *
 * @example
 * const { result } = await updateCustomerGroupsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "cusgrp_123"
 *     },
 *     update: {
 *       name: "VIP"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more customer groups.
 */
export declare const updateCustomerGroupsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateCustomerGroupsWorkflowInput, UpdateCustomerGroupsWorkflowOutput, []>;
//# sourceMappingURL=update-customer-groups.d.ts.map