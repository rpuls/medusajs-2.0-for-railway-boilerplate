"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("./services");
const defaults_1 = __importDefault(require("./loaders/defaults"));
const utils_1 = require("@medusajs/framework/utils");
exports.default = (0, utils_1.Module)(utils_1.Modules.REGION, {
    service: services_1.RegionModuleService,
    loaders: [defaults_1.default],
});
//# sourceMappingURL=index.js.map