"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePricePreferencesStep = exports.deletePricePreferencesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deletePricePreferencesStepId = "delete-price-preferences";
/**
 * This step deletes one or more price preferences.
 */
exports.deletePricePreferencesStep = (0, workflows_sdk_1.createStep)(exports.deletePricePreferencesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRICING);
    await service.softDeletePricePreferences(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRICING);
    await service.restorePricePreferences(prevIds);
});
//# sourceMappingURL=delete-price-preferences.js.map