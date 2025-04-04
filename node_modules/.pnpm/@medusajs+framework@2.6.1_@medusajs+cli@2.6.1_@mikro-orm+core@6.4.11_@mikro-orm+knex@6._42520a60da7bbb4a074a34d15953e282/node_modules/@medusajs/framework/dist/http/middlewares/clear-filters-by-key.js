"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearFiltersByKey = clearFiltersByKey;
function clearFiltersByKey(keys) {
    return async function clearFiltersByKeyMiddleware(req, _, next) {
        keys.forEach((key) => {
            delete req.filterableFields[key];
        });
        return next();
    };
}
//# sourceMappingURL=clear-filters-by-key.js.map