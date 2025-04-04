"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMedusaLinkModule = exports.registerMedusaModule = void 0;
const utils_1 = require("@medusajs/utils");
const definitions_1 = require("../definitions");
const types_1 = require("../types");
const registerMedusaModule = (moduleKey, moduleDeclaration, moduleExports, definition) => {
    const moduleResolutions = {};
    const modDefinition = definition ?? definitions_1.ModulesDefinition[moduleKey];
    const modDeclaration = moduleDeclaration ??
        modDefinition?.defaultModuleDeclaration;
    if (modDeclaration !== false && !modDeclaration) {
        throw new Error(`Module: ${moduleKey} has no declaration.`);
    }
    if ((0, utils_1.isObject)(modDeclaration) &&
        modDeclaration?.scope === types_1.MODULE_SCOPE.EXTERNAL) {
        // TODO: getExternalModuleResolution(...)
        throw new Error("External Modules are not supported yet.");
    }
    if (modDefinition === undefined) {
        moduleResolutions[moduleKey] = getCustomModuleResolution(moduleKey, moduleDeclaration);
        return moduleResolutions;
    }
    moduleResolutions[moduleKey] = getInternalModuleResolution(modDefinition, moduleDeclaration, moduleExports);
    return moduleResolutions;
};
exports.registerMedusaModule = registerMedusaModule;
function getCustomModuleResolution(key, moduleConfig) {
    const originalPath = (0, utils_1.normalizeImportPathWithSource)(((0, utils_1.isString)(moduleConfig) ? moduleConfig : moduleConfig.resolve));
    const resolutionPath = require.resolve(originalPath, {
        paths: [process.cwd()],
    });
    const conf = (0, utils_1.isObject)(moduleConfig)
        ? moduleConfig
        : {};
    const dependencies = conf?.dependencies ?? [];
    return {
        resolutionPath,
        definition: {
            key,
            label: `Custom: ${key}`,
            isRequired: false,
            defaultPackage: "",
            dependencies,
            defaultModuleDeclaration: {
                scope: types_1.MODULE_SCOPE.INTERNAL,
            },
        },
        moduleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
        dependencies,
        options: conf?.options ?? {},
    };
}
const registerMedusaLinkModule = (definition, moduleDeclaration, moduleExports) => {
    const moduleResolutions = {};
    moduleResolutions[definition.key] = getInternalModuleResolution(definition, moduleDeclaration, moduleExports);
    return moduleResolutions;
};
exports.registerMedusaLinkModule = registerMedusaLinkModule;
function getInternalModuleResolution(definition, moduleConfig, moduleExports) {
    if (typeof moduleConfig === "boolean") {
        if (!moduleConfig && definition.isRequired) {
            throw new Error(`Module: ${definition.label} is required`);
        }
        if (!moduleConfig) {
            return {
                resolutionPath: false,
                definition,
                dependencies: [],
                options: {},
            };
        }
    }
    const isObj = (0, utils_1.isObject)(moduleConfig);
    let resolutionPath = definition.defaultPackage;
    // If user added a module and it's overridable, we resolve that instead
    const isStr = (0, utils_1.isString)(moduleConfig);
    if (isStr || (isObj && moduleConfig.resolve)) {
        const originalPath = (0, utils_1.normalizeImportPathWithSource)(((0, utils_1.isString)(moduleConfig) ? moduleConfig : moduleConfig.resolve));
        resolutionPath = require.resolve(originalPath, {
            paths: [process.cwd()],
        });
    }
    const moduleDeclaration = isObj ? moduleConfig : {};
    const additionalDependencies = isObj ? moduleConfig.dependencies || [] : [];
    return {
        resolutionPath,
        definition,
        dependencies: [
            ...new Set((definition.dependencies || []).concat(additionalDependencies)),
        ],
        moduleDeclaration: {
            ...(definition.defaultModuleDeclaration ?? {}),
            ...moduleDeclaration,
        },
        moduleExports,
        options: isObj ? moduleConfig.options ?? {} : {},
    };
}
//# sourceMappingURL=register-modules.js.map