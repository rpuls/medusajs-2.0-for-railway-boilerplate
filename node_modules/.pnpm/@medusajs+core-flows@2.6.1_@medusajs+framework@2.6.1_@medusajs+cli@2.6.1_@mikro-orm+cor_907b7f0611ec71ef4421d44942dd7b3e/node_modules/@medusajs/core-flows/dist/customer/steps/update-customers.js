"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomersStep = exports.updateCustomersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCustomersStepId = "update-customer";
/**
 * This step updates one or more customers.
 *
 * @example
 * const data = updateCustomersStep({
 *   selector: {
 *     id: "cus_123"
 *   },
 *   update: {
 *     last_name: "Doe"
 *   }
 * })
 */
exports.updateCustomersStep = (0, workflows_sdk_1.createStep)(exports.updateCustomersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevCustomers = await service.listCustomers(data.selector, {
        select: selects,
        relations,
    });
    const customers = await service.updateCustomers(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(customers, prevCustomers);
}, async (prevCustomers, { container }) => {
    if (!prevCustomers?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await (0, utils_1.promiseAll)(prevCustomers.map((c) => service.updateCustomers(c.id, {
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        metadata: c.metadata,
    })));
});
//# sourceMappingURL=update-customers.js.map