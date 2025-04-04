"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerGroupsWorkflow = exports.updateCustomerGroupsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateCustomerGroupsWorkflowId = "update-customer-groups";
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
exports.updateCustomerGroupsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCustomerGroupsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateCustomerGroupsStep)(input));
});
//# sourceMappingURL=update-customer-groups.js.map