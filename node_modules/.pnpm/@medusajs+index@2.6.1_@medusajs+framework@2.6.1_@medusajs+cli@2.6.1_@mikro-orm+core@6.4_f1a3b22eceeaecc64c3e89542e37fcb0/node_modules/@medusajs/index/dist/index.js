"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _services_1 = require("./services");
const utils_1 = require("@medusajs/framework/utils");
const index_1 = __importDefault(require("./loaders/index"));
exports.default = (0, utils_1.Module)(utils_1.Modules.INDEX, {
    service: _services_1.IndexModuleService,
    loaders: [index_1.default],
});
//# sourceMappingURL=index.js.map