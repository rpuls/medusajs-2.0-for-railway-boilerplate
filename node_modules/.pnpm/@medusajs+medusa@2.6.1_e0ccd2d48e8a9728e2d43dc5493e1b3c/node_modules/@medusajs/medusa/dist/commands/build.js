"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = build;
const logger_1 = require("@medusajs/framework/logger");
const build_tools_1 = require("@medusajs/framework/build-tools");
async function build({ directory, adminOnly, }) {
    logger_1.logger.info("Starting build...");
    const compiler = new build_tools_1.Compiler(directory, logger_1.logger);
    const tsConfig = await compiler.loadTSConfigFile();
    if (!tsConfig) {
        logger_1.logger.error("Unable to compile application");
        process.exit(1);
    }
    const promises = [];
    if (!adminOnly) {
        promises.push(compiler.buildAppBackend(tsConfig));
    }
    const bundler = await import("@medusajs/admin-bundler");
    promises.push(compiler.buildAppFrontend(adminOnly, tsConfig, bundler));
    const responses = await Promise.all(promises);
    if (responses.every((response) => response === true)) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
}
//# sourceMappingURL=build.js.map