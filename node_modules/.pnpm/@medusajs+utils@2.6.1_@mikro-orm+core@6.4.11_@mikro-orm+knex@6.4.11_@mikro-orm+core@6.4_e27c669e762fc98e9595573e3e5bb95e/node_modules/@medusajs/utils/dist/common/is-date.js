"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDate = isDate;
function isDate(value) {
    return value !== null && !isNaN(new Date(value).valueOf());
}
//# sourceMappingURL=is-date.js.map