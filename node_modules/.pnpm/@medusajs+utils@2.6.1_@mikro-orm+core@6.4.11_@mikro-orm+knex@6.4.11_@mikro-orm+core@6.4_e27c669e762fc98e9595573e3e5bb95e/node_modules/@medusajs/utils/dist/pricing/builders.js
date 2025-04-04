"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPriceListRules = buildPriceListRules;
exports.buildPriceSetRules = buildPriceSetRules;
exports.buildPriceSetPricesForCore = buildPriceSetPricesForCore;
exports.buildPriceSetPricesForModule = buildPriceSetPricesForModule;
function buildPriceListRules(priceListRules) {
    return priceListRules?.reduce((acc, curr) => {
        const ruleAttribute = curr.attribute;
        const ruleValues = curr.value || [];
        acc[ruleAttribute] = ruleValues;
        return acc;
    }, {});
}
function buildPriceSetRules(priceRules) {
    if (typeof priceRules === "undefined") {
        return undefined;
    }
    return priceRules?.reduce((acc, curr) => {
        const ruleAttribute = curr.attribute;
        const ruleValue = curr.value;
        acc[ruleAttribute] = ruleValue;
        return acc;
    }, {});
}
function buildPriceSetPricesForCore(prices) {
    return prices?.map((price) => {
        const productVariant = price.price_set?.variant;
        const rules = typeof price.price_rules === "undefined"
            ? undefined
            : buildPriceSetRules(price.price_rules || []);
        delete price.price_rules;
        delete price.price_set;
        return {
            ...price,
            variant_id: productVariant?.id ?? undefined,
            rules,
        };
    });
}
function buildPriceSetPricesForModule(prices) {
    return prices?.map((price) => {
        const rules = typeof price.price_rules === "undefined"
            ? undefined
            : buildPriceSetRules(price.price_rules || []);
        return {
            ...price,
            price_set_id: price.price_set?.id,
            rules,
        };
    });
}
//# sourceMappingURL=builders.js.map