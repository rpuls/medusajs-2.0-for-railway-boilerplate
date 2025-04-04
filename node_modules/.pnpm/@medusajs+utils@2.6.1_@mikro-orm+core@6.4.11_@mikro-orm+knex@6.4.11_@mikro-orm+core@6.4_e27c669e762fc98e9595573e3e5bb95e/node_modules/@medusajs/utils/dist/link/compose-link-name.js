"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeTableName = exports.composeLinkName = void 0;
const common_1 = require("../common");
const composeLinkName = (...args) => {
    return (0, common_1.upperCaseFirst)((0, common_1.toPascalCase)((0, exports.composeTableName)(...args.concat("link"))));
};
exports.composeLinkName = composeLinkName;
const composeTableName = (...args) => {
    return args.map((name) => name.replace(/(_id|Service)$/gi, "")).join("_");
};
exports.composeTableName = composeTableName;
//# sourceMappingURL=compose-link-name.js.map