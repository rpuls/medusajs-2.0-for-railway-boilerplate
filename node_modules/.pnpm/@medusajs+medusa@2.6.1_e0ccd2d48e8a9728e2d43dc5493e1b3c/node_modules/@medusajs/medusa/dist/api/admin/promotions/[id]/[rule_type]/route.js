"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const utils_2 = require("../../utils");
const GET = async (req, res) => {
    const { id, rule_type: ruleType } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    (0, utils_2.validateRuleType)(ruleType);
    const dasherizedRuleType = ruleType.split("-").join("_");
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "promotion",
        variables: { id },
        fields: req.queryConfig.fields,
    });
    const [promotion] = await remoteQuery(queryObject);
    const ruleAttributes = (0, utils_2.getRuleAttributesMap)({
        promotionType: promotion?.type || req.query.promotion_type,
        applicationMethodType: promotion?.application_method?.type || req.query.application_method_type,
    })[ruleType];
    const promotionRules = [];
    if (dasherizedRuleType === utils_1.RuleType.RULES) {
        promotionRules.push(...(promotion?.rules || []));
    }
    else if (dasherizedRuleType === utils_1.RuleType.TARGET_RULES) {
        promotionRules.push(...(promotion?.application_method?.target_rules || []));
    }
    else if (dasherizedRuleType === utils_1.RuleType.BUY_RULES) {
        promotionRules.push(...(promotion?.application_method?.buy_rules || []));
    }
    const transformedRules = [];
    const disguisedRules = ruleAttributes.filter((attr) => !!attr.disguised);
    for (const disguisedRule of disguisedRules) {
        const getValues = () => {
            const value = promotion?.application_method?.[disguisedRule.id];
            if (disguisedRule.field_type === "number") {
                return value;
            }
            if (value) {
                return [{ label: value, value }];
            }
            return [];
        };
        const required = disguisedRule.required ?? true;
        const applicationMethod = promotion?.application_method;
        const recordValue = applicationMethod?.[disguisedRule.id];
        if (required || recordValue) {
            transformedRules.push({
                ...disguisedRule,
                id: undefined,
                attribute: disguisedRule.id,
                attribute_label: disguisedRule.label,
                operator: utils_1.RuleOperator.EQ,
                operator_label: utils_2.operatorsMap[utils_1.RuleOperator.EQ].label,
                value: undefined,
                values: getValues(),
            });
        }
        continue;
    }
    for (const promotionRule of [...promotionRules, ...transformedRules]) {
        const currentRuleAttribute = ruleAttributes.find((attr) => attr.value === promotionRule.attribute ||
            attr.value === promotionRule.attribute);
        if (!currentRuleAttribute) {
            continue;
        }
        const queryConfig = utils_2.ruleQueryConfigurations[currentRuleAttribute.id];
        if (!queryConfig) {
            continue;
        }
        const rows = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
            entryPoint: queryConfig.entryPoint,
            variables: {
                filters: {
                    [queryConfig.valueAttr]: promotionRule.values?.map((v) => v.value),
                },
            },
            fields: [queryConfig.labelAttr, queryConfig.valueAttr],
        }));
        const valueLabelMap = new Map(rows.map((row) => [
            row[queryConfig.valueAttr],
            row[queryConfig.labelAttr],
        ]));
        promotionRule.values =
            promotionRule.values?.map((value) => ({
                value: value.value,
                label: valueLabelMap.get(value.value) || value.value,
            })) || promotionRule.values;
        if (!currentRuleAttribute.hydrate) {
            transformedRules.push({
                ...currentRuleAttribute,
                ...promotionRule,
                attribute_label: currentRuleAttribute.label,
                operator_label: utils_2.operatorsMap[promotionRule.operator]?.label || promotionRule.operator,
            });
        }
    }
    res.json({
        rules: transformedRules,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map