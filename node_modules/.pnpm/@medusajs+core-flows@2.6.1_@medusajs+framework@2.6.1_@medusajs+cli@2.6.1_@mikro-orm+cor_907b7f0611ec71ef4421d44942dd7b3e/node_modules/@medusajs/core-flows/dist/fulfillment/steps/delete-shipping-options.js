"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOptionsStep = exports.deleteShippingOptionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteShippingOptionsStepId = "delete-shipping-options-step";
/**
 * This step deletes one or more shipping options.
 */
exports.deleteShippingOptionsStep = (0, workflows_sdk_1.createStep)(exports.deleteShippingOptionsStepId, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const softDeletedEntities = await service.softDeleteShippingOptions(ids);
    return new workflows_sdk_1.StepResponse({
        [utils_1.Modules.FULFILLMENT]: softDeletedEntities,
    }, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.restoreShippingOptions(prevIds);
});
//# sourceMappingURL=delete-shipping-options.js.map