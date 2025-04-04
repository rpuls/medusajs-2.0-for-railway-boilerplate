"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerGroupCustomersStep = exports.deleteCustomerGroupCustomersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCustomerGroupCustomersStepId = "delete-customer-group-customers";
/**
 * This step removes customers from groups.
 */
exports.deleteCustomerGroupCustomersStep = (0, workflows_sdk_1.createStep)(exports.deleteCustomerGroupCustomersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.removeCustomerFromGroup(data);
    return new workflows_sdk_1.StepResponse(void 0, data);
}, async (groupPairs, { container }) => {
    if (!groupPairs?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.addCustomerToGroup(groupPairs);
});
//# sourceMappingURL=delete-customer-group-customers.js.map