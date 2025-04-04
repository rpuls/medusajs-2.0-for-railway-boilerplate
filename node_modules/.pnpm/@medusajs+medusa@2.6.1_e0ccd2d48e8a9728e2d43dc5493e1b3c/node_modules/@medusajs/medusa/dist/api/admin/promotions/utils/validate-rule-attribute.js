"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRuleAttribute = validateRuleAttribute;
const utils_1 = require("@medusajs/framework/utils");
const rule_attributes_map_1 = require("./rule-attributes-map");
function validateRuleAttribute(attributes) {
    const { promotionType, ruleType, ruleAttributeId, applicationMethodType } = attributes;
    const ruleAttributes = (0, rule_attributes_map_1.getRuleAttributesMap)({
        promotionType,
        applicationMethodType,
    })[ruleType] || [];
    const ruleAttribute = ruleAttributes.find((obj) => obj.id === ruleAttributeId);
    if (!ruleAttribute) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Invalid rule attribute - ${ruleAttributeId}`);
    }
}
//# sourceMappingURL=validate-rule-attribute.js.map