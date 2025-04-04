"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _services_1 = require("./services");
const loaders_1 = require("./loaders");
exports.default = (0, utils_1.Module)(utils_1.Modules.WORKFLOW_ENGINE, {
    service: _services_1.WorkflowsModuleService,
    loaders: [loaders_1.loadUtils],
});
//# sourceMappingURL=index.js.map