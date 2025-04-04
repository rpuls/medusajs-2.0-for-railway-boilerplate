"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCustomerGroupsToCustomerStep = exports.linkCustomerGroupsToCustomerStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.linkCustomerGroupsToCustomerStepId = "link-customers-to-customer-group";
/**
 * This step manages the customer groups of a customer.
 *
 * @example
 * const data = linkCustomerGroupsToCustomerStep({
 *   id: "cus_123",
 *   add: ["cusgrp_123"],
 *   remove: ["cusgrp_456"]
 * })
 */
exports.linkCustomerGroupsToCustomerStep = (0, workflows_sdk_1.createStep)(exports.linkCustomerGroupsToCustomerStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const toAdd = (data.add ?? []).map((customerGroupId) => {
        return {
            customer_group_id: customerGroupId,
            customer_id: data.id,
        };
    });
    const toRemove = (data.remove ?? []).map((customerGroupId) => {
        return {
            customer_group_id: customerGroupId,
            customer_id: data.id,
        };
    });
    const promises = [];
    if (toAdd.length) {
        promises.push(service.addCustomerToGroup(toAdd));
    }
    if (toRemove.length) {
        promises.push(service.removeCustomerFromGroup(toRemove));
    }
    await (0, utils_1.promiseAll)(promises);
    return new workflows_sdk_1.StepResponse(void 0, { toAdd, toRemove });
}, async (prevData, { container }) => {
    if (!prevData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    if (prevData.toAdd.length) {
        await service.removeCustomerFromGroup(prevData.toAdd);
    }
    if (prevData.toRemove.length) {
        await service.addCustomerToGroup(prevData.toRemove);
    }
});
//# sourceMappingURL=link-customer-groups-customer.js.map