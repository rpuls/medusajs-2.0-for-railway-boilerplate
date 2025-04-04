"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDUSA_PROJECT_NAME = void 0;
exports.getResolvedPlugins = getResolvedPlugins;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("@medusajs/framework/utils");
const MEDUSA_APP_SOURCE_PATH = "src";
const MEDUSA_PLUGIN_SOURCE_PATH = ".medusa/server/src";
const MEDUSA_PLUGIN_OPTIONS_FILE_PATH = ".medusa/server/medusa-plugin-options.json";
exports.MEDUSA_PROJECT_NAME = "project-plugin";
function createPluginId(name) {
    return name;
}
function createFileContentHash(path, files) {
    return path + files;
}
/**
 * Returns the absolute path to the package.json file for a
 * given plugin identifier.
 */
async function resolvePluginPkgFile(rootDirectory, pluginPath) {
    try {
        const pkgJSONPath = require.resolve(path_1.default.join(pluginPath, "package.json"), {
            paths: [rootDirectory],
        });
        const packageJSONContents = JSON.parse(await promises_1.default.readFile(pkgJSONPath, "utf-8"));
        return { path: pkgJSONPath, contents: packageJSONContents };
    }
    catch (error) {
        if (error.code === "MODULE_NOT_FOUND" || error.code === "ENOENT") {
            throw new Error(`Unable to resolve plugin "${pluginPath}". Make sure the plugin directory has a package.json file`);
        }
        throw error;
    }
}
/**
 * Reads the "medusa-plugin-options.json" file from the plugin root
 * directory and returns its contents as an object.
 */
async function resolvePluginOptions(pluginRootDir) {
    try {
        const contents = await promises_1.default.readFile(path_1.default.join(pluginRootDir, MEDUSA_PLUGIN_OPTIONS_FILE_PATH), "utf-8");
        return JSON.parse(contents);
    }
    catch (error) {
        if (error.code === "MODULE_NOT_FOUND" || error.code === "ENOENT") {
            return {};
        }
        throw error;
    }
}
/**
 * Finds the correct path for the plugin. If it is a local plugin it will be
 * found in the plugins folder. Otherwise we will look for the plugin in the
 * installed npm packages.
 * @param {string} pluginPath - the name of the plugin to find. Should match
 *    the name of the folder where the plugin is contained.
 * @return {object} the plugin details
 */
async function resolvePlugin(rootDirectory, pluginPath, options) {
    const pkgJSON = await resolvePluginPkgFile(rootDirectory, pluginPath);
    const resolvedPath = path_1.default.dirname(pkgJSON.path);
    const name = pkgJSON.contents.name || pluginPath;
    const resolve = path_1.default.join(resolvedPath, MEDUSA_PLUGIN_SOURCE_PATH);
    const pluginStaticOptions = await resolvePluginOptions(resolvedPath);
    const modules = await (0, utils_1.readDir)(path_1.default.join(resolve, "modules"), {
        ignoreMissing: true,
    });
    const pluginOptions = options ?? {};
    return {
        resolve,
        name,
        id: createPluginId(name),
        options: pluginOptions,
        version: pkgJSON.contents.version || "0.0.0",
        adminResolve: path_1.default.join(pluginStaticOptions.srcDir ?? resolve, "admin"),
        modules: modules.map((mod) => {
            return {
                resolve: `${pluginPath}/${MEDUSA_PLUGIN_SOURCE_PATH}/modules/${mod.name}`,
                options: pluginOptions,
            };
        }),
    };
}
async function getResolvedPlugins(rootDirectory, configModule, isMedusaProject = false) {
    const resolved = await Promise.all((configModule?.plugins || []).map(async (plugin) => {
        if ((0, utils_1.isString)(plugin)) {
            return resolvePlugin(rootDirectory, plugin);
        }
        return resolvePlugin(rootDirectory, plugin.resolve, plugin.options);
    }));
    if (isMedusaProject) {
        const extensionDirectory = path_1.default.join(rootDirectory, MEDUSA_APP_SOURCE_PATH);
        resolved.push({
            resolve: extensionDirectory,
            name: exports.MEDUSA_PROJECT_NAME,
            id: createPluginId(exports.MEDUSA_PROJECT_NAME),
            adminResolve: path_1.default.join(extensionDirectory, "admin"),
            options: configModule,
            version: createFileContentHash(process.cwd(), `**`),
        });
    }
    return resolved;
}
//# sourceMappingURL=resolve-plugins.js.map