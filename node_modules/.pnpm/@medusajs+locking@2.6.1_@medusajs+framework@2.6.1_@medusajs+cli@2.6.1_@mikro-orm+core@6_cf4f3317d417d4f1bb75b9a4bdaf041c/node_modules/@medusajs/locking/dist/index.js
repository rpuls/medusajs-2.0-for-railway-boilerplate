"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const providers_1 = __importDefault(require("./loaders/providers"));
const locking_module_1 = __importDefault(require("./services/locking-module"));
exports.default = (0, utils_1.Module)(utils_1.Modules.LOCKING, {
    service: locking_module_1.default,
    loaders: [providers_1.default],
});
//# sourceMappingURL=index.js.map