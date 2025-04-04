"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyParamsAsFilters = applyParamsAsFilters;
function applyParamsAsFilters(mappings) {
    return async function paramsAsFiltersMiddleware(req, _, next) {
        for (const [param, paramValue] of Object.entries(req.params)) {
            if (mappings[param]) {
                req.filterableFields[mappings[param]] = paramValue;
            }
        }
        return next();
    };
}
//# sourceMappingURL=apply-params-as-filters.js.map