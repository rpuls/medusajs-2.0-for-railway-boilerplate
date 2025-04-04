"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFile = getConfigFile;
const path_1 = require("path");
const dynamic_import_1 = require("./dynamic-import");
/**
 * Attempts to resolve the config file in a given root directory.
 * @param {string} rootDir - the directory to find the config file in.
 * @param {string} configName - the name of the config file.
 * @return {object} an object containing the config module and its path as well as an error property if the config couldn't be loaded.
 */
async function getConfigFile(rootDir, configName) {
    const configPath = (0, path_1.join)(rootDir, configName);
    try {
        const configFilePath = (0, path_1.join)(process.cwd(), rootDir, configName);
        const resolvedExports = await (0, dynamic_import_1.dynamicImport)(configPath);
        return {
            configModule: "default" in resolvedExports && resolvedExports.default
                ? resolvedExports.default
                : resolvedExports,
            configFilePath,
            error: null,
        };
    }
    catch (e) {
        return {
            configModule: null,
            configFilePath: "",
            error: e,
        };
    }
}
//# sourceMappingURL=get-config-file.js.map