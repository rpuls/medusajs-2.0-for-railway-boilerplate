"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerAddressesWorkflow = exports.createCustomerAddressesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createCustomerAddressesWorkflowId = "create-customer-addresses";
/**
 * This workflow creates one or more addresses for customers. It's used by the [Add Customer Address Admin API Route](https://docs.medusajs.com/api/admin#customers_postcustomersidaddresses)
 * and the [Add Customer Address Store API Route](https://docs.medusajs.com/api/store#customers_postcustomersmeaddresses).
 *
 * This workflow has a hook that allows you to perform custom actions on the created customer addresses. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the addresses.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating customer addresses.
 *
 * @example
 * const { result } = await createCustomerAddressesWorkflow(container)
 * .run({
 *   input: {
 *     addresses: [
 *       {
 *         customer_id: "cus_123",
 *         address_1: "456 Elm St",
 *         city: "Los Angeles",
 *         country_code: "us",
 *         postal_code: "90001",
 *         first_name: "Jane",
 *         last_name: "Smith",
 *       },
 *       {
 *         customer_id: "cus_321",
 *         address_1: "789 Oak St",
 *         city: "New York",
 *         country_code: "us",
 *         postal_code: "10001",
 *         first_name: "Alice",
 *         last_name: "Johnson",
 *       }
 *     ],
 *     additional_data: {
 *       crm_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more customer addresses.
 *
 * @property hooks.addressesCreated - This hook is executed after the addresses are created. You can consume this hook to perform custom actions on the created addresses.
 */
exports.createCustomerAddressesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createCustomerAddressesWorkflowId, (input) => {
    const unsetInput = (0, workflows_sdk_1.transform)(input, (data) => ({
        create: data.addresses,
    }));
    (0, workflows_sdk_1.parallelize)((0, steps_1.maybeUnsetDefaultShippingAddressesStep)(unsetInput), (0, steps_1.maybeUnsetDefaultBillingAddressesStep)(unsetInput));
    const createdAddresses = (0, steps_1.createCustomerAddressesStep)(input.addresses);
    const addressesCreated = (0, workflows_sdk_1.createHook)("addressesCreated", {
        addresses: createdAddresses,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(createdAddresses, {
        hooks: [addressesCreated],
    });
});
//# sourceMappingURL=create-addresses.js.map