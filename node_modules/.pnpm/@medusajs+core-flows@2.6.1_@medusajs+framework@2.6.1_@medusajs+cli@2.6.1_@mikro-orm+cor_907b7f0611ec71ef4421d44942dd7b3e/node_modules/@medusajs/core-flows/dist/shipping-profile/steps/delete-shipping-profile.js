"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingProfilesStep = exports.deleteShippingProfilesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteShippingProfilesStepId = "delete-shipping-profile";
/**
 * This step deletes one or more shipping profiles.
 */
exports.deleteShippingProfilesStep = (0, workflows_sdk_1.createStep)(exports.deleteShippingProfilesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.softDeleteShippingProfiles(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.restoreShippingProfiles(prevIds);
});
//# sourceMappingURL=delete-shipping-profile.js.map