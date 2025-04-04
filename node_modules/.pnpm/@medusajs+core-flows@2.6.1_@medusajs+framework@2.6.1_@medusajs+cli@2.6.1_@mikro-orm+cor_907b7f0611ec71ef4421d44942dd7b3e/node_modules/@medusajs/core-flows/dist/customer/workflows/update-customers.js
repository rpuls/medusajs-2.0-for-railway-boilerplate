"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomersWorkflow = exports.updateCustomersWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.updateCustomersWorkflowId = "update-customers";
/**
 * This workflow updates one or more customers. It's used by the [Update Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersid) and
 * the [Update Customer Store API Route](https://docs.medusajs.com/api/store#customers_postcustomersme).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated customer. For example, you can pass under `additional_data` custom data to update
 * custom data models linked to the customers.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating customers.
 *
 * @example
 * const { result } = await updateCustomersWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["cus_123"]
 *     },
 *     update: {
 *       first_name: "John"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more customers.
 *
 * @property hooks.customersUpdated - This hook is executed after the customers are updated. You can consume this hook to perform custom actions on the updated customers.
 */
exports.updateCustomersWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCustomersWorkflowId, (input) => {
    const updatedCustomers = (0, steps_1.updateCustomersStep)(input);
    const customersUpdated = (0, workflows_sdk_1.createHook)("customersUpdated", {
        customers: updatedCustomers,
        additional_data: input.additional_data,
    });
    const customerIdEvents = (0, workflows_sdk_1.transform)({ updatedCustomers }, ({ updatedCustomers }) => {
        const arr = Array.isArray(updatedCustomers)
            ? updatedCustomers
            : [updatedCustomers];
        return arr?.map((customer) => {
            return { id: customer.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CustomerWorkflowEvents.UPDATED,
        data: customerIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedCustomers, {
        hooks: [customersUpdated],
    });
});
//# sourceMappingURL=update-customers.js.map