"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectSharedContext = InjectSharedContext;
const context_parameter_1 = require("./context-parameter");
function InjectSharedContext() {
    return function (target, propertyKey, descriptor) {
        if (!target.MedusaContextIndex_) {
            throw new Error(`To apply @InjectSharedContext you have to flag a parameter using @MedusaContext`);
        }
        const originalMethod = descriptor.value;
        const argIndex = target.MedusaContextIndex_[propertyKey];
        descriptor.value = function (...args) {
            const context = {
                ...(args[argIndex] ?? { __type: context_parameter_1.MedusaContextType }),
            };
            args[argIndex] = context;
            return originalMethod.apply(this, args);
        };
    };
}
//# sourceMappingURL=inject-shared-context.js.map