import { CustomerUpdatableFields, FilterableCustomerProps } from "@medusajs/framework/types";
/**
 * The data to update one or more customers.
 */
export type UpdateCustomersStepInput = {
    /**
     * The filters to select the customers to update.
     */
    selector: FilterableCustomerProps;
    /**
     * The data to update the customers with.
     */
    update: CustomerUpdatableFields;
};
export declare const updateCustomersStepId = "update-customer";
/**
 * This step updates one or more customers.
 *
 * @example
 * const data = updateCustomersStep({
 *   selector: {
 *     id: "cus_123"
 *   },
 *   update: {
 *     last_name: "Doe"
 *   }
 * })
 */
export declare const updateCustomersStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCustomersStepInput, import("@medusajs/framework/types").CustomerDTO[]>;
//# sourceMappingURL=update-customers.d.ts.map