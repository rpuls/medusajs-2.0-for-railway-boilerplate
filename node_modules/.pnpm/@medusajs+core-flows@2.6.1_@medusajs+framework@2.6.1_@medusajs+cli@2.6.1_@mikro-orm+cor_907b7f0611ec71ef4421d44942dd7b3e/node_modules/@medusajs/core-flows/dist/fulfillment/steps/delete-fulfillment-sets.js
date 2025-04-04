"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFulfillmentSetsStep = exports.deleteFulfillmentSetsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteFulfillmentSetsStepId = "delete-fulfillment-sets";
/**
 * This step deletes one or more fulfillment sets.
 */
exports.deleteFulfillmentSetsStep = (0, workflows_sdk_1.createStep)(exports.deleteFulfillmentSetsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.softDeleteFulfillmentSets(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.restoreFulfillmentSets(prevIds);
});
//# sourceMappingURL=delete-fulfillment-sets.js.map