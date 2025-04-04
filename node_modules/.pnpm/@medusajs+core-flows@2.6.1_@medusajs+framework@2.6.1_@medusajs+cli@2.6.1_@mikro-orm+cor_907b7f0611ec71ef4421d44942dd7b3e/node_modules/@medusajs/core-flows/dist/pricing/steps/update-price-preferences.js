"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePricePreferencesStep = exports.updatePricePreferencesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePricePreferencesStepId = "update-price-preferences";
/**
 * This step updates price preferences matching the specified filters.
 *
 * @example
 * const data = updatePricePreferencesStep({
 *   selector: {
 *     id: ["pp_123"]
 *   },
 *   update: {
 *     is_tax_inclusive: true
 *   }
 * })
 */
exports.updatePricePreferencesStep = (0, workflows_sdk_1.createStep)(exports.updatePricePreferencesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.PRICING);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        input.update,
    ]);
    const prevData = await service.listPricePreferences(input.selector, {
        select: selects,
        relations,
    });
    const updatedPricePreferences = await service.updatePricePreferences(input.selector, input.update);
    return new workflows_sdk_1.StepResponse(updatedPricePreferences, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRICING);
    await service.upsertPricePreferences(prevData);
});
//# sourceMappingURL=update-price-preferences.js.map