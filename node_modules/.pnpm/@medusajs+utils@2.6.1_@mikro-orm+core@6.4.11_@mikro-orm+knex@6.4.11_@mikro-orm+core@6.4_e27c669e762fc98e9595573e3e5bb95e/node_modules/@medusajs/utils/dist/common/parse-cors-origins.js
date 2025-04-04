"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCorsOrigins = parseCorsOrigins;
const build_regexp_if_valid_1 = require("./build-regexp-if-valid");
function parseCorsOrigins(str) {
    return !str
        ? []
        : str.split(",").map((subStr) => {
            return (0, build_regexp_if_valid_1.buildRegexpIfValid)(subStr) ?? subStr;
        });
}
//# sourceMappingURL=parse-cors-origins.js.map