"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomersStep = exports.deleteCustomersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCustomersStepId = "delete-customers";
/**
 * This step deletes one or more customers.
 */
exports.deleteCustomersStep = (0, workflows_sdk_1.createStep)(exports.deleteCustomersStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.softDeleteCustomers(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevCustomerIds, { container }) => {
    if (!prevCustomerIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.restoreCustomers(prevCustomerIds);
});
//# sourceMappingURL=delete-customers.js.map