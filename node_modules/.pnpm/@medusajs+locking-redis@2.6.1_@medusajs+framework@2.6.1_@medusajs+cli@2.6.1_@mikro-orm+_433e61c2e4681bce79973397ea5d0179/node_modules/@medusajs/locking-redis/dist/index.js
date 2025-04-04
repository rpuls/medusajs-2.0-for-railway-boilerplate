"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const loaders_1 = __importDefault(require("./loaders"));
const redis_lock_1 = require("./services/redis-lock");
const services = [redis_lock_1.RedisLockingProvider];
const loaders = [loaders_1.default];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.LOCKING, {
    services,
    loaders,
});
//# sourceMappingURL=index.js.map