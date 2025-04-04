"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleProvider = ModuleProvider;
/**
 * Wrapper to build the module provider export
 *
 * @param serviceName // The name of the module the provider is for
 * @param services // The array of services that the module provides
 * @param loaders // The loaders that the module provider provides
 */
function ModuleProvider(serviceName, { services, loaders }) {
    return {
        module: serviceName,
        services,
        loaders,
    };
}
//# sourceMappingURL=module-provider.js.map