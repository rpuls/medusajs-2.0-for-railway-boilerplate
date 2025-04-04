"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = serializeError;
function serializeError(error) {
    const serialized = {
        message: error.message,
        name: error.name,
        stack: error.stack,
    };
    Object.getOwnPropertyNames(error).forEach((key) => {
        // eslint-disable-next-line no-prototype-builtins
        if (!serialized.hasOwnProperty(key)) {
            serialized[key] = error[key];
        }
    });
    return serialized;
}
//# sourceMappingURL=serialize-error.js.map