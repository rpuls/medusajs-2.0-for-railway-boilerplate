"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerGroupStep = exports.deleteCustomerGroupStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCustomerGroupStepId = "delete-customer-groups";
/**
 * This step deletes one or more customer groups.
 */
exports.deleteCustomerGroupStep = (0, workflows_sdk_1.createStep)(exports.deleteCustomerGroupStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.softDeleteCustomerGroups(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevCustomerGroups, { container }) => {
    if (!prevCustomerGroups) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.restoreCustomerGroups(prevCustomerGroups);
});
//# sourceMappingURL=delete-customer-groups.js.map