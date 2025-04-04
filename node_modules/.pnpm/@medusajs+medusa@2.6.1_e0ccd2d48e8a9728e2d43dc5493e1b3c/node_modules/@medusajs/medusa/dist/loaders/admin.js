"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminLoader;
const logger_1 = require("@medusajs/framework/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const NOT_ALLOWED_PATHS = ["/auth", "/store", "/admin"];
async function adminLoader({ app, configModule, rootDirectory, plugins, }) {
    const { admin } = configModule;
    const sources = [];
    for (const plugin of plugins) {
        if (fs_1.default.existsSync(plugin.adminResolve)) {
            sources.push(plugin.adminResolve);
        }
    }
    const adminOptions = {
        disable: false,
        sources,
        ...admin,
        outDir: path_1.default.join(rootDirectory, utils_1.ADMIN_RELATIVE_OUTPUT_DIR),
    };
    if (adminOptions?.disable) {
        return app;
    }
    if (NOT_ALLOWED_PATHS.includes(adminOptions.path)) {
        logger_1.logger.error(`The 'admin.path' in 'medusa-config.js' is set to a value that is not allowed. This can prevent your server from working correctly. Please set 'admin.path' to a value that is not one of the following: ${NOT_ALLOWED_PATHS.join(", ")}.`);
    }
    if (process.env.NODE_ENV === "development") {
        return initDevelopmentServer(app, adminOptions);
    }
    return serveProductionBuild(app, adminOptions);
}
async function initDevelopmentServer(app, options) {
    const { develop } = await import("@medusajs/admin-bundler");
    const adminMiddleware = await develop(options);
    app.use(options.path, adminMiddleware);
    return app;
}
async function serveProductionBuild(app, options) {
    const { serve } = await import("@medusajs/admin-bundler");
    const adminRoute = await serve(options);
    app.use(options.path, adminRoute);
    return app;
}
//# sourceMappingURL=admin.js.map