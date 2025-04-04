"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerAddressesStep = exports.updateCustomerAddresseStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCustomerAddresseStepId = "update-customer-addresses";
/**
 * This step updates one or more customer addresses.
 *
 * @example
 * const data = updateCustomerAddressesStep({
 *   selector: {
 *     customer_id: "cus_123"
 *   },
 *   update: {
 *     country_code: "us"
 *   }
 * })
 */
exports.updateCustomerAddressesStep = (0, workflows_sdk_1.createStep)(exports.updateCustomerAddresseStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevCustomers = await service.listCustomerAddresses(data.selector, {
        select: selects,
        relations,
    });
    const customerAddresses = await service.updateCustomerAddresses(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(customerAddresses, prevCustomers);
}, async (prevCustomerAddresses, { container }) => {
    if (!prevCustomerAddresses) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await (0, utils_1.promiseAll)(prevCustomerAddresses.map((c) => service.updateCustomerAddresses(c.id, { ...c })));
});
//# sourceMappingURL=update-addresses.js.map