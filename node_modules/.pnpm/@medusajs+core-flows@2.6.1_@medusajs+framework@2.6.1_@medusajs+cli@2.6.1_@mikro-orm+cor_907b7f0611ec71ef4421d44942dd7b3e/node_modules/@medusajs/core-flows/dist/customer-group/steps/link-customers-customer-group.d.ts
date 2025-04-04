import { LinkWorkflowInput } from "@medusajs/framework/types";
export declare const linkCustomersToCustomerGroupStepId = "link-customers-to-customer-group";
/**
 * This step manages the customers in a customer group.
 *
 * @example
 * const data = linkCustomersToCustomerGroupStep({
 *   id: "cusgrp_123",
 *   add: ["cus_123"],
 *   remove: ["cus_456"]
 * })
 */
export declare const linkCustomersToCustomerGroupStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkWorkflowInput, undefined>;
//# sourceMappingURL=link-customers-customer-group.d.ts.map