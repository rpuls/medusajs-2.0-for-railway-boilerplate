"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerGroupsStep = exports.updateCustomerGroupStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCustomerGroupStepId = "update-customer-groups";
/**
 * This step updates one or more customer groups.
 *
 * @example
 * const data = updateCustomerGroupsStep({
 *   selector: {
 *     id: "cusgrp_123"
 *   },
 *   update: {
 *     name: "VIP"
 *   }
 * })
 */
exports.updateCustomerGroupsStep = (0, workflows_sdk_1.createStep)(exports.updateCustomerGroupStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevCustomerGroups = await service.listCustomerGroups(data.selector, {
        select: selects,
        relations,
    });
    const customers = await service.updateCustomerGroups(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(customers, prevCustomerGroups);
}, async (prevCustomerGroups, { container }) => {
    if (!prevCustomerGroups) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await (0, utils_1.promiseAll)(prevCustomerGroups.map((c) => service.updateCustomerGroups(c.id, {
        name: c.name,
        metadata: c.metadata,
    })));
});
//# sourceMappingURL=update-customer-groups.js.map