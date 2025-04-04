"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingProfilesStep = exports.createShippingProfilesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createShippingProfilesStepId = "create-shipping-profiles";
/**
 * This step creates one or more shipping profiles.
 */
exports.createShippingProfilesStep = (0, workflows_sdk_1.createStep)(exports.createShippingProfilesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const createdShippingProfiles = await service.createShippingProfiles(input);
    return new workflows_sdk_1.StepResponse(createdShippingProfiles, createdShippingProfiles.map((created) => created.id));
}, async (createdShippingProfiles, { container }) => {
    if (!createdShippingProfiles?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.deleteShippingProfiles(createdShippingProfiles);
});
//# sourceMappingURL=create-shipping-profiles.js.map