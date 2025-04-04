import { LinkWorkflowInput } from "@medusajs/framework/types";
/**
 * The data to manage the customers of a group.
 *
 * @property id - The ID of the customer group to manage its customers.
 * @property add - The IDs of the customers to add to the customer group.
 * @property remove - The IDs of the customers to remove from the customer group.
 */
export type LinkCustomersToCustomerGroupWorkflow = LinkWorkflowInput;
export declare const linkCustomersToCustomerGroupWorkflowId = "link-customers-to-customer-group";
/**
 * This workflow manages the customers of a customer group. It's used by the
 * [Manage Customers of Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroupsidcustomers).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the customers of a customer group within your custom flows.
 *
 * @example
 * const { result } = await linkCustomersToCustomerGroupWorkflow(container)
 * .run({
 *   input: {
 *     id: "cusgrp_123",
 *     add: ["cus_123"],
 *     remove: ["cus_456"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the customers of a customer group.
 */
export declare const linkCustomersToCustomerGroupWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkWorkflowInput, unknown, any[]>;
//# sourceMappingURL=link-customers-customer-group.d.ts.map