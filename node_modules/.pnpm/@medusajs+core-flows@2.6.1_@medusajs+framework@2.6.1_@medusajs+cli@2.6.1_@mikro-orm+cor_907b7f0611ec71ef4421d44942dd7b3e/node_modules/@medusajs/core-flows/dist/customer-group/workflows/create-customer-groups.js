"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerGroupsWorkflow = exports.createCustomerGroupsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createCustomerGroupsWorkflowId = "create-customer-groups";
/**
 * This workflow creates one or more customer groups. It's used by the
 * [Create Customer Group Admin API Route](https://docs.medusajs.com/api/admin#customer-groups_postcustomergroups).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create customer groups within your custom flows. For example, you can create customer groups to segregate
 * customers by age group or purchase habits.
 *
 * @example
 * const { result } = await createCustomerGroupsWorkflow(container)
 * .run({
 *   input: {
 *     customersData: [
 *       {
 *         name: "VIP"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more customer groups.
 */
exports.createCustomerGroupsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createCustomerGroupsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createCustomerGroupsStep)(input.customersData));
});
//# sourceMappingURL=create-customer-groups.js.map