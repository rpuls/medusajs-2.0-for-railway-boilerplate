"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLoader = void 0;
const logger_1 = require("../logger");
const resource_loader_1 = require("../utils/resource-loader");
class WorkflowLoader extends resource_loader_1.ResourceLoader {
    constructor(sourceDir) {
        super(sourceDir);
        this.resourceName = "workflow";
    }
    async onFileLoaded(path, fileExports) {
        logger_1.logger.debug(`Registering workflows from ${path}.`);
    }
    /**
     * Load workflows from the source paths, workflows are registering themselves,
     * therefore we only need to import them
     */
    async load() {
        await super.discoverResources();
        logger_1.logger.debug(`Workflows registered.`);
    }
}
exports.WorkflowLoader = WorkflowLoader;
//# sourceMappingURL=workflow-loader.js.map