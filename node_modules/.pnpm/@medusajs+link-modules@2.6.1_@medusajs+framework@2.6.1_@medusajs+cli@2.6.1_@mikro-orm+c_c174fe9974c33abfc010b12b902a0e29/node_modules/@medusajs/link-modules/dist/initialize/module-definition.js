"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkModuleDefinition = getLinkModuleDefinition;
const _services_1 = require("../services");
const loaders_1 = require("../loaders");
function getLinkModuleDefinition(joinerConfig, primary, foreign) {
    return {
        service: joinerConfig.isReadOnlyLink
            ? (0, _services_1.getReadOnlyModuleService)(joinerConfig)
            : (0, _services_1.getModuleService)(joinerConfig),
        loaders: (0, loaders_1.getLoaders)({
            joinerConfig,
            primary,
            foreign,
        }),
    };
}
//# sourceMappingURL=module-definition.js.map