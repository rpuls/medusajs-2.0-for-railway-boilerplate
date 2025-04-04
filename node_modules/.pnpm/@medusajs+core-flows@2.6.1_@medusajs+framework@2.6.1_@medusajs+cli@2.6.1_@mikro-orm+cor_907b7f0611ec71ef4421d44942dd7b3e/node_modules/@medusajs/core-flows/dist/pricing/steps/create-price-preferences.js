"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricePreferencesStep = exports.createPricePreferencesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createPricePreferencesStepId = "create-price-preferences";
/**
 * This step creates one or more price preferences.
 *
 * @example
 * const data = createPricePreferencesStep([{
 *   attribute: "region_id",
 *   value: "reg_123",
 *   is_tax_inclusive: true
 * }])
 */
exports.createPricePreferencesStep = (0, workflows_sdk_1.createStep)(exports.createPricePreferencesStepId, async (data, { container }) => {
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    const pricePreferences = await pricingModule.createPricePreferences(data);
    return new workflows_sdk_1.StepResponse(pricePreferences, pricePreferences.map((pricePreference) => pricePreference.id));
}, async (pricePreferences, { container }) => {
    if (!pricePreferences?.length) {
        return;
    }
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    await pricingModule.deletePricePreferences(pricePreferences);
});
//# sourceMappingURL=create-price-preferences.js.map