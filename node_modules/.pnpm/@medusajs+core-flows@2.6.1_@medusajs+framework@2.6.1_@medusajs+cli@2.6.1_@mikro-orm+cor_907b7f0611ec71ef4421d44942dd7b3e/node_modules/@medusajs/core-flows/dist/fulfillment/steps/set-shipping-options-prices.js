"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setShippingOptionsPricesStep = exports.setShippingOptionsPricesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
async function getCurrentShippingOptionPrices(shippingOptionIds, { remoteQuery }) {
    const shippingOptionPrices = (await remoteQuery({
        service: utils_1.LINKS.ShippingOptionPriceSet,
        variables: {
            filters: { shipping_option_id: shippingOptionIds },
        },
        fields: ["shipping_option_id", "price_set_id", "price_set.prices.*"],
    }));
    return shippingOptionPrices.map((shippingOption) => {
        const prices = shippingOption.price_set?.prices ?? [];
        const price_set_id = shippingOption.price_set_id;
        return {
            shipping_option_id: shippingOption.shipping_option_id,
            price_set_id,
            prices,
        };
    });
}
function buildPrices(prices, regionToCurrencyMap) {
    if (!prices) {
        return [];
    }
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
        if ("region_id" in price) {
            const currency_code = regionToCurrencyMap.get(price.region_id);
            const regionId = price.region_id;
            delete price.region_id;
            return {
                ...price,
                currency_code: currency_code,
                amount: price.amount,
                rules: {
                    region_id: regionId,
                    ...additionalRules,
                },
            };
        }
        if ("currency_code" in price) {
            return {
                ...price,
                amount: price.amount,
                rules: {
                    ...additionalRules,
                },
            };
        }
        return price;
    });
    return shippingOptionPrices;
}
exports.setShippingOptionsPricesStepId = "set-shipping-options-prices-step";
/**
 * This step sets the prices of one or more shipping options.
 *
 * @example
 * const data = setShippingOptionsPricesStep([
 *   {
 *     id: "so_123",
 *     prices: [
 *       {
 *         amount: 1000,
 *         currency_code: "usd",
 *       }
 *     ]
 *   }
 * ])
 */
exports.setShippingOptionsPricesStep = (0, workflows_sdk_1.createStep)(exports.setShippingOptionsPricesStepId, async (data, { container }) => {
    if (!data.length) {
        return;
    }
    const regionIds = data
        .map((input) => input.prices)
        .flat()
        .filter((price) => "region_id" in (price ?? {}))
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
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const currentShippingOptionPricesData = await getCurrentShippingOptionPrices(data.map((d) => d.id), { remoteQuery });
    const shippingOptionPricesMap = new Map(currentShippingOptionPricesData.map((currentShippingOptionDataItem) => {
        const shippingOptionData = data.find((d) => d.id === currentShippingOptionDataItem.shipping_option_id);
        const pricesData = shippingOptionData?.prices?.map((priceData) => {
            return {
                ...priceData,
                price_set_id: currentShippingOptionDataItem.price_set_id,
            };
        });
        const buildPricesData = pricesData && buildPrices(pricesData, regionToCurrencyMap);
        return [
            currentShippingOptionDataItem.shipping_option_id,
            {
                price_set_id: currentShippingOptionDataItem.price_set_id,
                prices: buildPricesData,
            },
        ];
    }));
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    for (const data_ of data) {
        const shippingOptionData = shippingOptionPricesMap.get(data_.id);
        if (!(0, utils_1.isDefined)(shippingOptionData.prices)) {
            continue;
        }
        await pricingService.updatePriceSets(shippingOptionData.price_set_id, {
            prices: shippingOptionData.prices,
        });
    }
    return new workflows_sdk_1.StepResponse(void 0, currentShippingOptionPricesData);
}, async (rollbackData, { container }) => {
    if (!rollbackData?.length) {
        return;
    }
    const pricingService = container.resolve(utils_1.Modules.PRICING);
    for (const data_ of rollbackData) {
        const prices = data_.prices;
        if (!(0, utils_1.isDefined)(prices)) {
            continue;
        }
        await pricingService.updatePriceSets(data_.price_set_id, { prices });
    }
});
//# sourceMappingURL=set-shipping-options-prices.js.map