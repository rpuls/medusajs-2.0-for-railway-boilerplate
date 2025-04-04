"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerAddressesWorkflow = exports.updateCustomerAddressesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateCustomerAddressesWorkflowId = "update-customer-addresses";
/**
 * This workflow updates one or more addresses for customers. It's used by the [Update Customer Address Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersidaddressesaddress_id)
 * and the [Update Customer Address Store API Route](https://docs.medusajs.com/api/store#customers_postcustomersmeaddressesaddress_id).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated customer addresses. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the addresses.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating customer addresses.
 *
 * @example
 * const { result } = await updateCustomerAddressesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       customer_id: "123"
 *     },
 *     update: {
 *       first_name: "John"
 *     },
 *     additional_data: {
 *       crm_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more customer addresses.
 *
 * @property hooks.addressesUpdated - This hook is executed after the addresses are updated. You can consume this hook to perform custom actions on the updated addresses.
 */
exports.updateCustomerAddressesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCustomerAddressesWorkflowId, (input) => {
    const unsetInput = (0, workflows_sdk_1.transform)(input, (data) => ({
        update: data,
    }));
    (0, workflows_sdk_1.parallelize)((0, steps_1.maybeUnsetDefaultShippingAddressesStep)(unsetInput), (0, steps_1.maybeUnsetDefaultBillingAddressesStep)(unsetInput));
    const updatedAddresses = (0, steps_1.updateCustomerAddressesStep)(input);
    const addressesUpdated = (0, workflows_sdk_1.createHook)("addressesUpdated", {
        addresses: updatedAddresses,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedAddresses, {
        hooks: [addressesUpdated],
    });
});
//# sourceMappingURL=update-addresses.js.map