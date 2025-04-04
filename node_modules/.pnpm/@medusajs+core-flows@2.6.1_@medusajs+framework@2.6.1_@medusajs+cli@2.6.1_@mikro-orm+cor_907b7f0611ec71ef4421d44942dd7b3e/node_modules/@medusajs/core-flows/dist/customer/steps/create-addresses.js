"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerAddressesStep = exports.createCustomerAddressesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCustomerAddressesStepId = "create-customer-addresses";
/**
 * This step creates one or more customer addresses.
 *
 * @example
 * const data = createCustomerAddressesStep([
 *   {
 *     customer_id: "cus_123",
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "123 Main St",
 *     city: "Anytown",
 *     province: "NY",
 *     postal_code: "12345",
 *     country_code: "us",
 *   }
 * ])
 */
exports.createCustomerAddressesStep = (0, workflows_sdk_1.createStep)(exports.createCustomerAddressesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const addresses = await service.createCustomerAddresses(data);
    return new workflows_sdk_1.StepResponse(addresses, addresses.map((address) => address.id));
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.deleteCustomerAddresses(ids);
});
//# sourceMappingURL=create-addresses.js.map