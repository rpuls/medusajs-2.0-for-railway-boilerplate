"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActionReference = setActionReference;
function setActionReference(existing, action, options) {
    if (options?.addActionReferenceToObject) {
        existing.actions ??= [];
        existing.actions.push(action);
    }
}
//# sourceMappingURL=set-action-reference.js.map