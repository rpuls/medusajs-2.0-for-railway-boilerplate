"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const utils_2 = require("../../../utils");
/*
  This endpoint returns all the potential values for rules (promotion rules, target rules and buy rules)
  given an attribute of a rule. The response for different rule_attributes are returned uniformly
  as an array of labels and values.
  Eg. If the rule_attribute requested is "currency_code" for "rules" rule type, we return currencies
  from the currency module.
*/
const GET = async (req, res) => {
    const { rule_type: ruleType, rule_attribute_id: ruleAttributeId, promotion_type: promotionType, application_method_type: applicationMethodType, } = req.params;
    const queryConfig = utils_2.ruleQueryConfigurations[ruleAttributeId];
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const filterableFields = req.filterableFields;
    if (filterableFields.value) {
        filterableFields[queryConfig.valueAttr] = filterableFields.value;
        delete filterableFields.value;
    }
    (0, utils_2.validateRuleType)(ruleType);
    (0, utils_2.validateRuleAttribute)({
        promotionType,
        ruleType,
        ruleAttributeId,
        applicationMethodType,
    });
    const { rows } = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: queryConfig.entryPoint,
        variables: {
            filters: filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: [queryConfig.labelAttr, queryConfig.valueAttr],
    }));
    const values = rows.map((r) => ({
        label: r[queryConfig.labelAttr],
        value: r[queryConfig.valueAttr],
    }));
    res.json({
        values,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map