"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerGroupsStep = exports.createCustomerGroupsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCustomerGroupsStepId = "create-customer-groups";
/**
 * This step creates one or more customer groups.
 */
exports.createCustomerGroupsStep = (0, workflows_sdk_1.createStep)(exports.createCustomerGroupsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const createdCustomerGroups = await service.createCustomerGroups(data);
    return new workflows_sdk_1.StepResponse(createdCustomerGroups, createdCustomerGroups.map((createdCustomerGroups) => createdCustomerGroups.id));
}, async (createdCustomerGroupIds, { container }) => {
    if (!createdCustomerGroupIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.deleteCustomers(createdCustomerGroupIds);
});
//# sourceMappingURL=create-customer-groups.js.map