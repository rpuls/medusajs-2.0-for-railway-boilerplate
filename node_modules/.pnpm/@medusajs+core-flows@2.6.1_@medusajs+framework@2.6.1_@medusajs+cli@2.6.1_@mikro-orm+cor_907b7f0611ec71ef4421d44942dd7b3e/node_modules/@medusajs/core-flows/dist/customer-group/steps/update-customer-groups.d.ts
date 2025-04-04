import { CustomerGroupUpdatableFields, FilterableCustomerGroupProps } from "@medusajs/framework/types";
/**
 * The data to update customer groups.
 */
export type UpdateCustomerGroupStepInput = {
    /**
     * The filters to select the customer groups to update.
     */
    selector: FilterableCustomerGroupProps;
    /**
     * The data to update in the customer groups.
     */
    update: CustomerGroupUpdatableFields;
};
export declare const updateCustomerGroupStepId = "update-customer-groups";
/**
 * This step updates one or more customer groups.
 *
 * @example
 * const data = updateCustomerGroupsStep({
 *   selector: {
 *     id: "cusgrp_123"
 *   },
 *   update: {
 *     name: "VIP"
 *   }
 * })
 */
export declare const updateCustomerGroupsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCustomerGroupStepInput, import("@medusajs/framework/types").CustomerGroupDTO[]>;
//# sourceMappingURL=update-customer-groups.d.ts.map