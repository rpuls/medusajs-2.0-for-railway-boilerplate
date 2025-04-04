"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePriceListPricesStep = exports.removePriceListPricesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removePriceListPricesStepId = "remove-price-list-prices";
/**
 * This step removes prices from a price list.
 */
exports.removePriceListPricesStep = (0, workflows_sdk_1.createStep)(exports.removePriceListPricesStepId, async (ids, { container }) => {
    if (!ids.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    const prices = await pricingModule.listPrices({ id: ids }, { relations: ["price_list"] });
    const priceIds = prices.map((price) => price.id);
    await pricingModule.softDeletePrices(priceIds);
    return new workflows_sdk_1.StepResponse(priceIds, priceIds);
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    await pricingModule.restorePrices(ids);
});
//# sourceMappingURL=remove-price-list-prices.js.map