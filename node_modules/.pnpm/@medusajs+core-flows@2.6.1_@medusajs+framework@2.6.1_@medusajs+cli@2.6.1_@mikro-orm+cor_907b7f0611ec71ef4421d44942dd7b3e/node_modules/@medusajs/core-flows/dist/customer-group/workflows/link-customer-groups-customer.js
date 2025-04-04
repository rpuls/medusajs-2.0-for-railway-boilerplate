"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCustomerGroupsToCustomerWorkflow = exports.linkCustomerGroupsToCustomerWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.linkCustomerGroupsToCustomerWorkflowId = "link-customer-groups-to-customer";
/**
 * This workflow manages the customer groups a customer is in. It's used by the
 * [Manage Groups of Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersidcustomergroups).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the customer groups of a customer in your custom flow.
 *
 * @example
 * const { result } = await linkCustomerGroupsToCustomerWorkflow(container)
 * .run({
 *   input: {
 *     id: "cus_123",
 *     add: ["cusgrp_123"],
 *     remove: ["cusgrp_456"]
 *   }
 * })
 *
 * @summary
 *
 * Manage groups of a customer.
 */
exports.linkCustomerGroupsToCustomerWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkCustomerGroupsToCustomerWorkflowId, (input) => {
    return (0, steps_1.linkCustomerGroupsToCustomerStep)(input);
});
//# sourceMappingURL=link-customer-groups-customer.js.map