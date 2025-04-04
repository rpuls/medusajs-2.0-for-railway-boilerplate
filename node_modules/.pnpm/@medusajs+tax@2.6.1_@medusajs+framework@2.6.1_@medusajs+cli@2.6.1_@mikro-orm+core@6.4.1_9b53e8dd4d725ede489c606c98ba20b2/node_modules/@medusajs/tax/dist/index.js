"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _services_1 = require("./services");
const providers_1 = __importDefault(require("./loaders/providers"));
const utils_1 = require("@medusajs/framework/utils");
exports.default = (0, utils_1.Module)(utils_1.Modules.TAX, {
    service: _services_1.TaxModuleService,
    loaders: [providers_1.default],
});
//# sourceMappingURL=index.js.map