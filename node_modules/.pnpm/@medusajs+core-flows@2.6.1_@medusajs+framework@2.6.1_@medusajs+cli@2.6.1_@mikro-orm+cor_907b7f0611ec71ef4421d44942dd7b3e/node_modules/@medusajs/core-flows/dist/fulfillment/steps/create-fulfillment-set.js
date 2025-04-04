"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFulfillmentSets = exports.createFulfillmentSetsId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createFulfillmentSetsId = "create-fulfillment-sets";
/**
 * This step creates one or more fulfillment sets.
 */
exports.createFulfillmentSets = (0, workflows_sdk_1.createStep)(exports.createFulfillmentSetsId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const createSets = await service.createFulfillmentSets(data);
    return new workflows_sdk_1.StepResponse(createSets, createSets.map((createdSet) => createdSet.id));
}, async (createSetIds, { container }) => {
    if (!createSetIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.deleteFulfillmentSets(createSetIds);
});
//# sourceMappingURL=create-fulfillment-set.js.map