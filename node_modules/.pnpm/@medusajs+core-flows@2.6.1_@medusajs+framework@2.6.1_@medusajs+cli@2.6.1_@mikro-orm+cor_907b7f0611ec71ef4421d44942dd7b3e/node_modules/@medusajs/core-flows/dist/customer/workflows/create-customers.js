"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomersWorkflow = exports.createCustomersWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.createCustomersWorkflowId = "create-customers";
/**
 * This workflow creates one or more customers. It's used by the [Create Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomers).
 *
 * This workflow has a hook that allows you to perform custom actions on the created customer. You can see an example in [this guide](https://docs.medusajs.com/resources/commerce-modules/customer/extend).
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating customers.
 *
 * @example
 * const { result } = await createCustomersWorkflow(container)
 * .run({
 *   input: {
 *     customersData: [
 *       {
 *         first_name: "John",
 *         last_name: "Doe",
 *         email: "john.doe@example.com",
 *       },
 *     ],
 *     additional_data: {
 *       position_name: "Editor",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more customers.
 *
 * @property hooks.customersCreated - This hook is executed after the customers are created. You can consume this hook to perform custom actions on the created customers.
 */
exports.createCustomersWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createCustomersWorkflowId, (input) => {
    const createdCustomers = (0, steps_1.createCustomersStep)(input.customersData);
    const customersCreated = (0, workflows_sdk_1.createHook)("customersCreated", {
        customers: createdCustomers,
        additional_data: input.additional_data,
    });
    const customerIdEvents = (0, workflows_sdk_1.transform)({ createdCustomers }, ({ createdCustomers }) => {
        return createdCustomers.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CustomerWorkflowEvents.CREATED,
        data: customerIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(createdCustomers, {
        hooks: [customersCreated],
    });
});
//# sourceMappingURL=create-customers.js.map