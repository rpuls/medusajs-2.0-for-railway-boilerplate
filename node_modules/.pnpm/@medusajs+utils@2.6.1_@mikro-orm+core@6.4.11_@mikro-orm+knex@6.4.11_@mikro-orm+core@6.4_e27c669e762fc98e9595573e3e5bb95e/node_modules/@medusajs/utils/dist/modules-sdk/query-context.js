"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryContext = void 0;
const __type = "QueryContext";
function QueryContextFn(query) {
    return {
        ...query,
        __type,
    };
}
QueryContextFn.isQueryContext = (obj) => {
    return obj.__type === __type;
};
exports.QueryContext = QueryContextFn;
//# sourceMappingURL=query-context.js.map