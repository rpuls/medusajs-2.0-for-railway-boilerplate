"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setContext = setContext;
function setContext(context) {
    return async (req, _, next) => {
        const ctx = { ...(req.context || {}) };
        for (const [contextKey, contextValue] of Object.entries(context || {})) {
            let valueToApply = contextValue;
            if (typeof contextValue === "function") {
                valueToApply = await contextValue(req, ctx);
            }
            ctx[contextKey] = valueToApply;
        }
        req.context = ctx;
        return next();
    };
}
//# sourceMappingURL=set-context.js.map