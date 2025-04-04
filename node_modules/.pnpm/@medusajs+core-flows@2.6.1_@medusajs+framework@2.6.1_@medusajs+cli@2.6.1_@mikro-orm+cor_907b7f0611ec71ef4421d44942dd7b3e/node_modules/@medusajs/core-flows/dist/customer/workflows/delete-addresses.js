"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerAddressesWorkflow = exports.deleteCustomerAddressesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteCustomerAddressesWorkflowId = "delete-customer-addresses";
/**
 * This workflow deletes one or more customer addresses. It's used by the
 * [Remove Customer Addresses Admin API Route](https://docs.medusajs.com/api/admin#customers_deletecustomersidaddressesaddress_id)
 * and the [Remove Customer Addresses Store API Route](https://docs.medusajs.com/api/store#customers_deletecustomersmeaddressesaddress_id).
 *
 * :::note
 *
 * This workflow deletes addresses created by the [Customer Module](https://docs.medusajs.com/resources/commerce-modules/customer)
 * only. So, you can't delete addresses attached to a cart, for example. To do that, use the workflow
 * relevant to that module.
 *
 * :::
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete customer addresses in your custom flows.
 *
 * @example
 * const { result } = await deleteCustomerAddressesWorkflow(container)
 * .run({
 *   input: {
 *     ids: [
 *       "cuaddress_123"
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more customer addresses.
 *
 * @property hooks.addressesDeleted - This hook is executed after the addresses are deleted. You can consume this hook to perform custom actions.
 */
exports.deleteCustomerAddressesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteCustomerAddressesWorkflowId, (input) => {
    const deletedAddresses = (0, steps_1.deleteCustomerAddressesStep)(input.ids);
    const addressesDeleted = (0, workflows_sdk_1.createHook)("addressesDeleted", {
        ids: input.ids,
    });
    return new workflows_sdk_1.WorkflowResponse(deletedAddresses, {
        hooks: [addressesDeleted],
    });
});
//# sourceMappingURL=delete-addresses.js.map