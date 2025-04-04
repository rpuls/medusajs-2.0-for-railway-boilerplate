"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleAttributesMap = exports.DisguisedRule = void 0;
const utils_1 = require("@medusajs/framework/utils");
const operators_map_1 = require("./operators-map");
var DisguisedRule;
(function (DisguisedRule) {
    DisguisedRule["APPLY_TO_QUANTITY"] = "apply_to_quantity";
    DisguisedRule["BUY_RULES_MIN_QUANTITY"] = "buy_rules_min_quantity";
    DisguisedRule["CURRENCY_CODE"] = "currency_code";
})(DisguisedRule || (exports.DisguisedRule = DisguisedRule = {}));
const ruleAttributes = [
    {
        id: "customer_group",
        value: "customer.groups.id",
        label: "Customer Group",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "region",
        value: "region.id",
        label: "Region",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "country",
        value: "shipping_address.country_code",
        label: "Country",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "sales_channel",
        value: "sales_channel_id",
        label: "Sales Channel",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
];
const commonAttributes = [
    {
        id: "product",
        value: "items.product.id",
        label: "Product",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "product_category",
        value: "items.product.categories.id",
        label: "Product Category",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "product_collection",
        value: "items.product.collection_id",
        label: "Product Collection",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "product_type",
        value: "items.product.type_id",
        label: "Product Type",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
    {
        id: "product_tag",
        value: "items.product.tags.id",
        label: "Product Tag",
        required: false,
        field_type: "multiselect",
        operators: Object.values(operators_map_1.operatorsMap),
    },
];
const currencyRule = {
    id: DisguisedRule.CURRENCY_CODE,
    value: DisguisedRule.CURRENCY_CODE,
    label: "Currency Code",
    field_type: "select",
    required: true,
    disguised: true,
    hydrate: true,
    operators: [operators_map_1.operatorsMap[utils_1.RuleOperator.EQ]],
};
const buyGetBuyRules = [
    {
        id: DisguisedRule.BUY_RULES_MIN_QUANTITY,
        value: DisguisedRule.BUY_RULES_MIN_QUANTITY,
        label: "Minimum quantity of items",
        field_type: "number",
        required: true,
        disguised: true,
        operators: [operators_map_1.operatorsMap[utils_1.RuleOperator.EQ]],
    },
];
const buyGetTargetRules = [
    {
        id: DisguisedRule.APPLY_TO_QUANTITY,
        value: DisguisedRule.APPLY_TO_QUANTITY,
        label: "Quantity of items promotion will apply to",
        field_type: "number",
        required: true,
        disguised: true,
        operators: [operators_map_1.operatorsMap[utils_1.RuleOperator.EQ]],
    },
];
const getRuleAttributesMap = ({ promotionType, applicationMethodType, }) => {
    const map = {
        rules: [...ruleAttributes],
        "target-rules": [...commonAttributes],
        "buy-rules": [...commonAttributes],
    };
    if (applicationMethodType === utils_1.ApplicationMethodType.FIXED) {
        map["rules"].push({ ...currencyRule });
    }
    else {
        map["rules"].push({ ...currencyRule, required: false });
    }
    if (promotionType === utils_1.PromotionType.BUYGET) {
        map["buy-rules"].push(...buyGetBuyRules);
        map["target-rules"].push(...buyGetTargetRules);
    }
    return map;
};
exports.getRuleAttributesMap = getRuleAttributesMap;
//# sourceMappingURL=rule-attributes-map.js.map