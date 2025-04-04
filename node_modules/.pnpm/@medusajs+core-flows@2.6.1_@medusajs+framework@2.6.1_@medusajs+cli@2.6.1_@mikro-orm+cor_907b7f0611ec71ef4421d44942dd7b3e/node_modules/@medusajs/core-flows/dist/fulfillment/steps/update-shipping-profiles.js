"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingProfilesStep = exports.updateShippingProfilesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateShippingProfilesStepId = "update-shipping-profiles";
/**
 * This step updates shipping profiles matching the specified filters.
 *
 * @example
 * const data = updateShippingProfilesStep({
 *   selector: {
 *     id: "sp_123"
 *   },
 *   update: {
 *     name: "Standard"
 *   }
 * })
 */
exports.updateShippingProfilesStep = (0, workflows_sdk_1.createStep)(exports.updateShippingProfilesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        input.update,
    ]);
    const prevData = await service.listShippingProfiles(input.selector, {
        select: selects,
        relations,
    });
    const profiles = await service.updateShippingProfiles(input.selector, input.update);
    return new workflows_sdk_1.StepResponse(profiles, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.upsertShippingProfiles(prevData);
});
//# sourceMappingURL=update-shipping-profiles.js.map