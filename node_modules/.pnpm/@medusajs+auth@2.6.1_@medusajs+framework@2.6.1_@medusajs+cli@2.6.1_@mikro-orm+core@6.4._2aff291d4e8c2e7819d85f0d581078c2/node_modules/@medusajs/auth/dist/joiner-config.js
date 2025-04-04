"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("./models");
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.AUTH, {
    models: [_models_1.AuthIdentity, _models_1.ProviderIdentity],
});
//# sourceMappingURL=joiner-config.js.map