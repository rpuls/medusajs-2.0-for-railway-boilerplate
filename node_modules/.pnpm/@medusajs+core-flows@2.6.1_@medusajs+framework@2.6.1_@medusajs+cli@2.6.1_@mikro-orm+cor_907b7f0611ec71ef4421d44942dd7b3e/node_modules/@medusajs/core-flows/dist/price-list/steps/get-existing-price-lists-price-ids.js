"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingPriceListsPriceIdsStep = exports.getExistingPriceListsPriceIdsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getExistingPriceListsPriceIdsStepId = "get-existing-price-lists-prices";
/**
 * This step retrieves prices of price lists.
 */
exports.getExistingPriceListsPriceIdsStep = (0, workflows_sdk_1.createStep)(exports.getExistingPriceListsPriceIdsStepId, async (data, { container }) => {
    const { price_list_ids: priceListIds = [] } = data;
    const priceListPriceIdsMap = {};
    const pricingModule = container.resolve(utils_1.Modules.PRICING);
    const existingPrices = priceListIds.length
        ? await pricingModule.listPrices({ price_list_id: priceListIds }, { relations: ["price_list"] })
        : [];
    for (const price of existingPrices) {
        const priceListId = price.price_list.id;
        const prices = priceListPriceIdsMap[priceListId] || [];
        priceListPriceIdsMap[priceListId] = prices.concat(price.id);
    }
    return new workflows_sdk_1.StepResponse(priceListPriceIdsMap);
});
//# sourceMappingURL=get-existing-price-lists-price-ids.js.map