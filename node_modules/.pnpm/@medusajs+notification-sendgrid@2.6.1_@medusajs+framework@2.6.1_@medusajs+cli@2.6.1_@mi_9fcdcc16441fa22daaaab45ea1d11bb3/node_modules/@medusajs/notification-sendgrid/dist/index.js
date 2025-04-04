"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const sendgrid_1 = require("./services/sendgrid");
const services = [sendgrid_1.SendgridNotificationService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.NOTIFICATION, {
    services,
});
//# sourceMappingURL=index.js.map