"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceSetsStep = exports.updatePriceSetsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePriceSetsStepId = "update-price-sets";
/**
 * This step updates price sets.
 *
 * @example
 * const data = updatePriceSetsStep({
 *   selector: {
 *     id: ["pset_123"]
 *   },
 *   update: {
 *     prices: [
 *       {
 *         amount: 10,
 *         currency_code: "usd",
 *       }
 *     ]
 *   }
 * })
 */
exports.updatePriceSetsStep = (0, workflows_sdk_1.createStep)(exports.updatePriceSetsStepId, async (data, { container }) => {
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    if ("price_sets" in data) {
        if (data.price_sets.some((p) => !p.id)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Price set id is required when doing a batch update");
        }
        const prevData = await pricingModule.listPriceSets({
            id: data.price_sets.map((p) => p.id),
        });
        const priceSets = await pricingModule.upsertPriceSets(data.price_sets);
        return new workflows_sdk_1.StepResponse(priceSets, prevData);
    }
    if (!data.selector || !data.update) {
        return new workflows_sdk_1.StepResponse([], null);
    }
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([data.update], { objectFields: ["rules"] });
    const dataBeforeUpdate = await pricingModule.listPriceSets(data.selector, {
        select: selects,
        relations,
    });
    const updatedPriceSets = await pricingModule.updatePriceSets(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(updatedPriceSets, dataBeforeUpdate);
}, async (revertInput, { container }) => {
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    if (!revertInput) {
        return;
    }
    await pricingModule.upsertPriceSets(revertInput);
});
//# sourceMappingURL=update-price-sets.js.map