"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomersStep = exports.createCustomersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCustomersStepId = "create-customers";
/**
 * This step creates one or more customers.
 *
 * @example
 * const data = createCustomersStep([
 *   {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "customer@example.com",
 *   }
 * ])
 */
exports.createCustomersStep = (0, workflows_sdk_1.createStep)(exports.createCustomersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const createdCustomers = await service.createCustomers(data);
    return new workflows_sdk_1.StepResponse(createdCustomers, createdCustomers.map((createdCustomers) => createdCustomers.id));
}, async (createdCustomerIds, { container }) => {
    if (!createdCustomerIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.deleteCustomers(createdCustomerIds);
});
//# sourceMappingURL=create-customers.js.map