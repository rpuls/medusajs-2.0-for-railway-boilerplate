"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectorConstraintsToString = selectorConstraintsToString;
function selectorConstraintsToString(selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    return selectors
        .map((selector_) => {
        return Object.entries(selector_)
            .map(([key, value]) => `${key}: ${value._type ? `${value._type}(${value._value})` : value}`)
            .join(", ");
    })
        .join(" or ");
}
//# sourceMappingURL=selector-constraints-to-string.js.map