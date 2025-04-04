import { LinkWorkflowInput } from "@medusajs/framework/types";
export declare const linkCustomerGroupsToCustomerStepId = "link-customers-to-customer-group";
/**
 * This step manages the customer groups of a customer.
 *
 * @example
 * const data = linkCustomerGroupsToCustomerStep({
 *   id: "cus_123",
 *   add: ["cusgrp_123"],
 *   remove: ["cusgrp_456"]
 * })
 */
export declare const linkCustomerGroupsToCustomerStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkWorkflowInput, undefined>;
//# sourceMappingURL=link-customer-groups-customer.d.ts.map