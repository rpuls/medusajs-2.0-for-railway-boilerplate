"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCustomersToCustomerGroupStep = exports.linkCustomersToCustomerGroupStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.linkCustomersToCustomerGroupStepId = "link-customers-to-customer-group";
/**
 * This step manages the customers in a customer group.
 *
 * @example
 * const data = linkCustomersToCustomerGroupStep({
 *   id: "cusgrp_123",
 *   add: ["cus_123"],
 *   remove: ["cus_456"]
 * })
 */
exports.linkCustomersToCustomerGroupStep = (0, workflows_sdk_1.createStep)(exports.linkCustomersToCustomerGroupStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const toAdd = (data.add ?? []).map((customerId) => {
        return {
            customer_id: customerId,
            customer_group_id: data.id,
        };
    });
    const toRemove = (data.remove ?? []).map((customerId) => {
        return {
            customer_id: customerId,
            customer_group_id: data.id,
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
//# sourceMappingURL=link-customers-customer-group.js.map