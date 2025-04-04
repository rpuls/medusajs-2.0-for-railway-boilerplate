"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operatorsMap = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.operatorsMap = {
    [utils_1.RuleOperator.IN]: {
        id: utils_1.RuleOperator.IN,
        value: utils_1.RuleOperator.IN,
        label: "In",
    },
    [utils_1.RuleOperator.EQ]: {
        id: utils_1.RuleOperator.EQ,
        value: utils_1.RuleOperator.EQ,
        label: "Equals",
    },
    [utils_1.RuleOperator.NE]: {
        id: utils_1.RuleOperator.NE,
        value: utils_1.RuleOperator.NE,
        label: "Not In",
    },
};
//# sourceMappingURL=operators-map.js.map