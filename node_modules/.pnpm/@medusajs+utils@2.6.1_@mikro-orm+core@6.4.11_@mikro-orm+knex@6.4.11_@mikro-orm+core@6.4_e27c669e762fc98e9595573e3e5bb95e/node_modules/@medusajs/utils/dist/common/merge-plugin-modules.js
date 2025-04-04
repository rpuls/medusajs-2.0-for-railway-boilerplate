"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePluginModules = mergePluginModules;
const define_config_1 = require("./define-config");
/**
 * Mutates the configModules object and merges the plugin modules with
 * the modules defined inside the user-config file
 */
function mergePluginModules(configModule, plugins) {
    /**
     * Create a flat array of all the modules exposed by the registered
     * plugins
     */
    const pluginsModules = plugins.reduce((result, plugin) => {
        if (plugin.modules) {
            result = result.concat(plugin.modules);
        }
        return result;
    }, []);
    /**
     * Merge plugin modules with the modules defined within the
     * config file.
     */
    configModule.modules = {
        ...(0, define_config_1.transformModules)(pluginsModules),
        ...configModule.modules,
    };
}
//# sourceMappingURL=merge-plugin-modules.js.map