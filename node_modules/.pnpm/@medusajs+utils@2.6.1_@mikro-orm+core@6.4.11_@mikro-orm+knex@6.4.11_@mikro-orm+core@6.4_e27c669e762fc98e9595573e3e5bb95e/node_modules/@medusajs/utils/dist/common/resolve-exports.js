"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveExports = resolveExports;
function resolveExports(moduleExports) {
    if ("default" in moduleExports &&
        moduleExports.default &&
        "default" in moduleExports.default) {
        return resolveExports(moduleExports.default);
    }
    return moduleExports;
}
//# sourceMappingURL=resolve-exports.js.map