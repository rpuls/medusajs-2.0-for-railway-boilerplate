"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCustomersToCustomerGroupWorkflow = exports.linkCustomersToCustomerGroupWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.linkCustomersToCustomerGroupWorkflowId = "link-customers-to-customer-group";
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
exports.linkCustomersToCustomerGroupWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkCustomersToCustomerGroupWorkflowId, (input) => {
    return (0, steps_1.linkCustomersToCustomerGroupStep)(input);
});
//# sourceMappingURL=link-customers-customer-group.js.map