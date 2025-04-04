"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const utils_1 = require("@medusajs/framework/utils");
const initialize = async (options) => {
    const serviceKey = utils_1.Modules.CACHE;
    const loaded = await modules_sdk_1.MedusaModule.bootstrap({
        moduleKey: serviceKey,
        defaultPath: "@medusajs//cache-inmemory",
        declaration: options,
    });
    return loaded[serviceKey];
};
exports.initialize = initialize;
//# sourceMappingURL=index.js.map