"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const advisory_lock_1 = require("./services/advisory-lock");
const services = [advisory_lock_1.PostgresAdvisoryLockProvider];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.LOCKING, {
    services,
});
//# sourceMappingURL=index.js.map