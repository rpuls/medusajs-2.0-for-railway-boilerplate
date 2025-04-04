"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectIntoContext = InjectIntoContext;
function InjectIntoContext(properties) {
    return function (target, propertyKey, descriptor) {
        if (!target.MedusaContextIndex_) {
            throw new Error(`To apply @InjectIntoContext you have to flag a parameter using @MedusaContext`);
        }
        const argIndex = target.MedusaContextIndex_[propertyKey];
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            for (const key of Object.keys(properties)) {
                args[argIndex] = args[argIndex] ?? {};
                args[argIndex][key] =
                    args[argIndex][key] ??
                        (typeof properties[key] === "function"
                            ? properties[key].apply(this, args)
                            : properties[key]);
            }
            return await original.apply(this, args);
        };
    };
}
//# sourceMappingURL=inject-into-context.js.map