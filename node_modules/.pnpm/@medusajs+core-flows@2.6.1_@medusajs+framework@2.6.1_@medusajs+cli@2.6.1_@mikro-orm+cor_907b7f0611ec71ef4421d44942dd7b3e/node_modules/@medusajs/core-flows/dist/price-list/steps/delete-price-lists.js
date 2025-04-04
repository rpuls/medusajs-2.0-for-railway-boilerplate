"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePriceListsStep = exports.deletePriceListsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deletePriceListsStepId = "delete-price-lists";
/**
 * This step deletes one or more price lists.
 */
exports.deletePriceListsStep = (0, workflows_sdk_1.createStep)(exports.deletePriceListsStepId, async (ids, { container }) => {
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    await pricingModule.softDeletePriceLists(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (idsToRestore, { container }) => {
    if (!idsToRestore?.length) {
        return;
    }
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    await pricingModule.restorePriceLists(idsToRestore);
});
//# sourceMappingURL=delete-price-lists.js.map