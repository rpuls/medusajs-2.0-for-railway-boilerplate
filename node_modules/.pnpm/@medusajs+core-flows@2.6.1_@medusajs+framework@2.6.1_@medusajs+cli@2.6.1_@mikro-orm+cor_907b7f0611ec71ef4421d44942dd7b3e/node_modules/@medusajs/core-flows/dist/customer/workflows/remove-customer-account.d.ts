export type RemoveCustomerAccountWorkflowInput = {
    customerId: string;
};
export declare const removeCustomerAccountWorkflowId = "remove-customer-account";
/**
 * This workflow deletes a customer and remove its association to its auth identity. It's used by the
 * [Delete Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_deletecustomersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete customer accounts within your custom flows.
 *
 * :::note
 *
 * This workflow uses the {@link deleteCustomersWorkflow} which has a hook that allows you to perform
 * custom actions after the customers are deleted.
 *
 * :::
 *
 * @example
 * const { result } = await removeCustomerAccountWorkflow(container)
 * .run({
 *   input: {
 *     customerId: "cus_123"
 *   }
 * })
 *
 * @summary
 *
 * Delete a customer account and its auth identity association.
 */
export declare const removeCustomerAccountWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemoveCustomerAccountWorkflowInput, string, []>;
//# sourceMappingURL=remove-customer-account.d.ts.map