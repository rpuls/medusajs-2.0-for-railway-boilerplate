"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleLoader = void 0;
const awilix_1 = require("awilix");
const os_1 = require("os");
const types_1 = require("../types");
const utils_1 = require("./utils");
const moduleLoader = async ({ container, moduleResolutions, logger, migrationOnly, loaderOnly, }) => {
    for (const resolution of Object.values(moduleResolutions ?? {})) {
        const registrationResult = await loadModule(container, resolution, logger, migrationOnly, loaderOnly);
        if (registrationResult?.error) {
            const { error } = registrationResult;
            logger?.error(`Could not resolve module: ${resolution.definition.label}. Error: ${error.message}${os_1.EOL}`);
            throw error;
        }
    }
};
exports.moduleLoader = moduleLoader;
async function loadModule(container, resolution, logger, migrationOnly, loaderOnly) {
    const modDefinition = resolution.definition;
    if (!modDefinition.key) {
        throw new Error(`Module definition is missing property "key"`);
    }
    const keyName = modDefinition.key;
    const { scope } = resolution.moduleDeclaration ?? {};
    const canSkip = !resolution.resolutionPath &&
        !modDefinition.isRequired &&
        !modDefinition.defaultPackage;
    if (scope === types_1.MODULE_SCOPE.EXTERNAL && !canSkip) {
        // TODO: implement external Resolvers
        // return loadExternalModule(...)
        throw new Error("External Modules are not supported yet.");
    }
    if (!scope) {
        let message = `The module ${resolution.definition.label} has to define its scope (internal | external)`;
        container.register(keyName, (0, awilix_1.asValue)(undefined));
        return {
            error: new Error(message),
        };
    }
    if (resolution.resolutionPath === false) {
        container.register(keyName, (0, awilix_1.asValue)(undefined));
        return;
    }
    return await (0, utils_1.loadInternalModule)({
        container,
        resolution,
        logger,
        migrationOnly,
        loaderOnly,
    });
}
//# sourceMappingURL=module-loader.js.map