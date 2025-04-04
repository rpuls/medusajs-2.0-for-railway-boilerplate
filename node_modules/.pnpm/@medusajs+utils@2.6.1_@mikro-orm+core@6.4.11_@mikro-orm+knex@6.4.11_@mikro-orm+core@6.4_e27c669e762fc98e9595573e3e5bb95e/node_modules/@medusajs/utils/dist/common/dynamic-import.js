"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicImport = dynamicImport;
const resolve_exports_1 = require("./resolve-exports");
/**
 * Utility that should be used instead of either await import() or require()
 * to avoid bundling issues. That way we have a single place
 * where we manage the strategy to dynamically import a module.
 *
 * This issue arise from migration to Node16 or NodeNext module resolution as well
 * as ts-node not being maintained anymore and throwing deprecation warnings.
 * all over the place.
 *
 * @param path
 */
async function dynamicImport(path) {
    const module = require(path);
    return (0, resolve_exports_1.resolveExports)(module);
}
//# sourceMappingURL=dynamic-import.js.map