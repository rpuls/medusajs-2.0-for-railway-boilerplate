"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomersWorkflow = exports.deleteCustomersWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.deleteCustomersWorkflowId = "delete-customers";
/**
 * This workflow deletes one or more customers. It's used by the
 * {@link removeCustomerAccountWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete customers in your custom flows.
 *
 * @example
 * const { result } = await deleteCustomersWorkflow(container)
 * .run({
 *   input: {
 *     ids: [
 *       "cus_123",
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more customers.
 *
 * @property hooks.customersDeleted - This hook is executed after the customers are deleted. You can consume this hook to perform custom actions.
 */
exports.deleteCustomersWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteCustomersWorkflowId, (input) => {
    const deletedCustomers = (0, steps_1.deleteCustomersStep)(input.ids);
    const customersDeleted = (0, workflows_sdk_1.createHook)("customersDeleted", {
        ids: input.ids,
    });
    const customerIdEvents = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return input.ids?.map((id) => {
            return { id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CustomerWorkflowEvents.DELETED,
        data: customerIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(deletedCustomers, {
        hooks: [customersDeleted],
    });
});
//# sourceMappingURL=delete-customers.js.map