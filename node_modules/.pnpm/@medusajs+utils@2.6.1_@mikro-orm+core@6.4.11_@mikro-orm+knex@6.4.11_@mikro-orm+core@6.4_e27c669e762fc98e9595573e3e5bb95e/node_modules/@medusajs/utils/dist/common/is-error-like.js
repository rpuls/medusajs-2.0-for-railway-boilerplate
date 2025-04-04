"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorLike = isErrorLike;
function isErrorLike(value) {
    return (!!value &&
        typeof value === "object" &&
        "name" in value &&
        "message" in value &&
        "stack" in value);
}
//# sourceMappingURL=is-error-like.js.map