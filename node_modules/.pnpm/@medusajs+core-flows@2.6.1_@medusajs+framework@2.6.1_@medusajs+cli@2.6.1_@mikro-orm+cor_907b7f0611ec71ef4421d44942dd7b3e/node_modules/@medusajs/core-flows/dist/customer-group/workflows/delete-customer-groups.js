"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerGroupsWorkflow = exports.deleteCustomerGroupsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteCustomerGroupsWorkflowId = "delete-customer-groups";
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
exports.deleteCustomerGroupsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteCustomerGroupsWorkflowId, (input) => {
    return (0, steps_1.deleteCustomerGroupStep)(input.ids);
});
//# sourceMappingURL=delete-customer-groups.js.map