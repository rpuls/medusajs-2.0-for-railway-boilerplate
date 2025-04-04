"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateIdPropertyError = void 0;
class DuplicateIdPropertyError extends Error {
    constructor(modelName) {
        super(`The model ${modelName} can only have one usage of the id() property`);
    }
}
exports.DuplicateIdPropertyError = DuplicateIdPropertyError;
//# sourceMappingURL=errors.js.map