"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPascalCase = toPascalCase;
function toPascalCase(s) {
    return s.replace(/(^\w|_\w)/g, (match) => match.replace(/_/g, "").toUpperCase());
}
//# sourceMappingURL=to-pascal-case.js.map