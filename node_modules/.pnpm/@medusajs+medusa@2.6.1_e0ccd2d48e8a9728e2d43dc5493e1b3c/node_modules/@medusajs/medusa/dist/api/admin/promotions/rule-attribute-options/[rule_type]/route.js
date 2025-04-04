"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("../../utils");
const GET = async (req, res) => {
    const { rule_type: ruleType } = req.params;
    (0, utils_1.validateRuleType)(ruleType);
    const attributes = (0, utils_1.getRuleAttributesMap)({
        promotionType: req.query.promotion_type,
        applicationMethodType: req.query.application_method_type,
    })[ruleType] || [];
    res.json({
        attributes,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map