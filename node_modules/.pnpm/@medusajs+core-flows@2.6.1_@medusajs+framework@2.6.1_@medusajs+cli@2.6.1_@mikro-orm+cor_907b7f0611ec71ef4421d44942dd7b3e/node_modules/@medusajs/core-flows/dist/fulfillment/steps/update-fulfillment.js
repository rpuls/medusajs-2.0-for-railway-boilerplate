"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFulfillmentStep = exports.updateFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateFulfillmentStepId = "update-fulfillment";
/**
 * This step updates a fulfillment.
 *
 * @example
 * const data = updateFulfillmentStep({
 *   id: "ful_123",
 *   delivered_at: new Date(),
 * })
 */
exports.updateFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.updateFulfillmentStepId, async (input, { container }) => {
    const { id, ...data } = input;
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([data]);
    const fulfillment = await service.retrieveFulfillment(id, {
        select: selects,
        relations,
    });
    const updated = await service.updateFulfillment(id, data);
    return new workflows_sdk_1.StepResponse(updated, fulfillment);
}, async (fulfillment, { container }) => {
    if (!fulfillment) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const { id, ...data } = fulfillment;
    // TODO: this does not revert the relationships that are created in invoke step
    // There should be a consistent way to handle across workflows
    await service.updateFulfillment(id, data);
});
//# sourceMappingURL=update-fulfillment.js.map