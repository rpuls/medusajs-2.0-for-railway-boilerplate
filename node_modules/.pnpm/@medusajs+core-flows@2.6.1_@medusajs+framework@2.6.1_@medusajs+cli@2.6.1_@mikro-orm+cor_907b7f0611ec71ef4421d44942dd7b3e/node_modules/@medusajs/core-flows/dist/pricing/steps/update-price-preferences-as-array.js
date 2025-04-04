"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePricePreferencesAsArrayStep = exports.updatePricePreferencesAsArrayStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePricePreferencesAsArrayStepId = "update-price-preferences-as-array";
/**
 * This step creates or updates price preferences.
 *
 * @example
 * const data = updatePricePreferencesAsArrayStep([
 *   {
 *     attribute: "region_id",
 *     value: "reg_123",
 *     is_tax_inclusive: true
 *   }
 * ])
 */
exports.updatePricePreferencesAsArrayStep = (0, workflows_sdk_1.createStep)(exports.updatePricePreferencesAsArrayStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.PRICING);
    const prevData = await service.listPricePreferences({
        $or: input.map((entry) => {
            if (!entry.attribute || !entry.value) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Attribute and value must be provided when updating price preferences");
            }
            return { attribute: entry.attribute, value: entry.value };
        }, {}),
    });
    const toUpsert = input.map((entry) => {
        const prevEntry = prevData.find((prevEntry) => prevEntry.attribute === entry.attribute &&
            prevEntry.value === entry.value);
        return {
            id: prevEntry?.id,
            attribute: entry.attribute,
            value: entry.value,
            is_tax_inclusive: entry.is_tax_inclusive ?? prevEntry?.is_tax_inclusive,
        };
    });
    const upsertedPricePreferences = await service.upsertPricePreferences(toUpsert);
    const newIds = (0, utils_1.arrayDifference)(upsertedPricePreferences.map((p) => p.id), prevData.map((p) => p.id));
    return new workflows_sdk_1.StepResponse(upsertedPricePreferences, {
        prevData,
        newDataIds: newIds,
    });
}, async (compensationData, { container }) => {
    if (!compensationData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRICING);
    await service.upsertPricePreferences(compensationData.prevData);
    await service.deletePricePreferences(compensationData.newDataIds);
});
//# sourceMappingURL=update-price-preferences-as-array.js.map