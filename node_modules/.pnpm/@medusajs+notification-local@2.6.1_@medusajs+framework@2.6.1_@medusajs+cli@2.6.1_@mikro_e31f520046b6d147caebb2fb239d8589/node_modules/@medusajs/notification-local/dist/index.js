"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const local_1 = require("./services/local");
const services = [local_1.LocalNotificationService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.NOTIFICATION, {
    services,
});
//# sourceMappingURL=index.js.map