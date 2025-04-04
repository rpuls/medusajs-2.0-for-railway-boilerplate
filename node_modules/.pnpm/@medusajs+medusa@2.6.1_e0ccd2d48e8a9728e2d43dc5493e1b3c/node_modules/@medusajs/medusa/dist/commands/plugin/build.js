"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = build;
const build_tools_1 = require("@medusajs/framework/build-tools");
const logger_1 = require("@medusajs/framework/logger");
async function build({ directory }) {
    logger_1.logger.info("Starting build...");
    const compiler = new build_tools_1.Compiler(directory, logger_1.logger);
    const tsConfig = await compiler.loadTSConfigFile();
    if (!tsConfig) {
        logger_1.logger.error("Unable to compile plugin");
        process.exit(1);
    }
    const bundler = await import("@medusajs/admin-bundler");
    const responses = await Promise.all([
        compiler.buildPluginBackend(tsConfig),
        compiler.buildPluginAdminExtensions(bundler),
    ]);
    if (responses.every((response) => response === true)) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
}
//# sourceMappingURL=build.js.map