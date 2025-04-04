"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaContextType = void 0;
exports.MedusaContext = MedusaContext;
function MedusaContext() {
    return function (target, propertyKey, parameterIndex) {
        target.MedusaContextIndex_ ??= {};
        target.MedusaContextIndex_[propertyKey] = parameterIndex;
    };
}
MedusaContext.getIndex = function (target, propertyKey) {
    return target.MedusaContextIndex_?.[propertyKey];
};
exports.MedusaContextType = "MedusaContext";
//# sourceMappingURL=context-parameter.js.map