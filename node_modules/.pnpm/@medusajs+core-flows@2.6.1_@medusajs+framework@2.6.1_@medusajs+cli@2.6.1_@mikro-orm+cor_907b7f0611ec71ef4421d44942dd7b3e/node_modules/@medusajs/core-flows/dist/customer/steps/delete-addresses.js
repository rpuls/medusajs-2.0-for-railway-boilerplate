"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerAddressesStep = exports.deleteCustomerAddressesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCustomerAddressesStepId = "delete-customer-addresses";
/**
 * This step deletes one or more customer addresses.
 */
exports.deleteCustomerAddressesStep = (0, workflows_sdk_1.createStep)(exports.deleteCustomerAddressesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const existing = await service.listCustomerAddresses({
        id: ids,
    });
    await service.deleteCustomerAddresses(ids);
    return new workflows_sdk_1.StepResponse(void 0, existing);
}, async (prevAddresses, { container }) => {
    if (!prevAddresses?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.createCustomerAddresses(prevAddresses);
});
//# sourceMappingURL=delete-addresses.js.map