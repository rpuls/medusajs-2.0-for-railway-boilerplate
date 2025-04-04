"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBuilders = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.eventBuilders = {
    createdPriceSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.CREATED,
        object: "price_set",
        eventName: utils_1.PricingEvents.PRICE_SET_CREATED,
    }),
    createdPrice: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.CREATED,
        object: "price",
        eventName: utils_1.PricingEvents.PRICE_CREATED,
    }),
    createdPriceRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.CREATED,
        object: "price_rule",
        eventName: utils_1.PricingEvents.PRICE_RULE_CREATED,
    }),
    createdPriceList: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.CREATED,
        object: "price_list",
        eventName: utils_1.PricingEvents.PRICE_LIST_CREATED,
    }),
    createdPriceListRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.CREATED,
        object: "price_list_rule",
        eventName: utils_1.PricingEvents.PRICE_LIST_RULE_CREATED,
    }),
    updatedPriceSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.UPDATED,
        object: "price_set",
        eventName: utils_1.PricingEvents.PRICE_SET_UPDATED,
    }),
    updatedPrice: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.UPDATED,
        object: "price",
        eventName: utils_1.PricingEvents.PRICE_UPDATED,
    }),
    updatedPriceList: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.UPDATED,
        object: "price_list",
        eventName: utils_1.PricingEvents.PRICE_LIST_UPDATED,
    }),
    updatedPriceListRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.UPDATED,
        object: "price_list_rule",
        eventName: utils_1.PricingEvents.PRICE_LIST_RULE_UPDATED,
    }),
    updatedPriceRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.UPDATED,
        object: "price_rule",
        eventName: utils_1.PricingEvents.PRICE_RULE_UPDATED,
    }),
    deletedPriceSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.DELETED,
        object: "price_set",
        eventName: utils_1.PricingEvents.PRICE_SET_DELETED,
    }),
    deletedPrice: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.DELETED,
        object: "price",
        eventName: utils_1.PricingEvents.PRICE_DELETED,
    }),
    deletedPriceList: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.DELETED,
        object: "price_list",
        eventName: utils_1.PricingEvents.PRICE_LIST_DELETED,
    }),
    deletedPriceListRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.DELETED,
        object: "price_list_rule",
        eventName: utils_1.PricingEvents.PRICE_LIST_RULE_DELETED,
    }),
    deletedPriceRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRICING,
        action: utils_1.CommonEvents.DELETED,
        object: "price_rule",
        eventName: utils_1.PricingEvents.PRICE_RULE_DELETED,
    }),
};
//# sourceMappingURL=events.js.map