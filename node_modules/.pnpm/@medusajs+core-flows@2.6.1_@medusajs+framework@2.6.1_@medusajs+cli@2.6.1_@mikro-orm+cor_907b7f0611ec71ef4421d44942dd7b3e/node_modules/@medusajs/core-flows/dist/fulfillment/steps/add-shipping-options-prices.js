"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingOptionsPriceSetsStep = exports.createShippingOptionsPriceSetsStepId = void 0;
exports.buildPriceSet = buildPriceSet;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
function buildPriceSet(prices, regionToCurrencyMap) {
    const shippingOptionPrices = prices.map((price) => {
        const { rules = [] } = price;
        const additionalRules = {};
        for (const rule of rules) {
            let existingPriceRules = additionalRules[rule.attribute];
            if ((0, utils_1.isString)(existingPriceRules)) {
                continue;
            }
            existingPriceRules ||= [];
            existingPriceRules.push({
                operator: rule.operator,
                value: rule.value,
            });
            additionalRules[rule.attribute] = existingPriceRules;
        }
        if ("currency_code" in price) {
            return {
                currency_code: price.currency_code,
                amount: price.amount,
                rules: additionalRules,
            };
        }
        return {
            currency_code: regionToCurrencyMap.get(price.region_id),
            amount: price.amount,
            rules: {
                region_id: price.region_id,
                ...additionalRules,
            },
        };
    });
    return { prices: shippingOptionPrices };
}
exports.createShippingOptionsPriceSetsStepId = "add-shipping-options-prices-step";
/**
 * This step creates price sets for one or more shipping options.
 */
exports.createShippingOptionsPriceSetsStep = (0, workflows_sdk_1.createStep)(exports.createShippingOptionsPriceSetsStepId, async (data, { container }) => {
    if (!data?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const regionIds = data
        .map((input) => input.prices)
        .flat()
        .filter((price) => {
        return "region_id" in price;
    })
        .map((price) => price.region_id);
    let regionToCurrencyMap = new Map();
    if (regionIds.length) {
        const regionService = container.resolve(utils_1.Modules.REGION);
        const regions = await regionService.listRegions({
            id: [...new Set(regionIds)],
        }, {
            select: ["id", "currency_code"],
        });
        regionToCurrencyMap = new Map(regions.map((region) => [region.id, region.currency_code]));
    }
    const priceSetsData = data.map((input) => buildPriceSet(input.prices, regionToCurrencyMap));
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    const priceSets = await pricingService.createPriceSets(priceSetsData);
    const shippingOptionPriceSetLinData = data.map((input, index) => {
        return {
            id: input.id,
            priceSetId: priceSets[index].id,
        };
    });
    return new workflows_sdk_1.StepResponse(shippingOptionPriceSetLinData, priceSets.map((priceSet) => priceSet.id));
}, async (priceSetIds, { container }) => {
    if (!priceSetIds?.length) {
        return;
    }
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    await pricingService.deletePriceSets(priceSetIds);
});
//# sourceMappingURL=add-shipping-options-prices.js.map