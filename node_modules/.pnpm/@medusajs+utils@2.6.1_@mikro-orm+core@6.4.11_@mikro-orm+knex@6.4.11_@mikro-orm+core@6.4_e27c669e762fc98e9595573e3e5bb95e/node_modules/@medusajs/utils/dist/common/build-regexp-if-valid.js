"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRegexpIfValid = buildRegexpIfValid;
function buildRegexpIfValid(str) {
    try {
        const m = str.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/);
        if (m) {
            return new RegExp(m[2], m[3]);
        }
    }
    catch (e) { }
    return;
}
//# sourceMappingURL=build-regexp-if-valid.js.map