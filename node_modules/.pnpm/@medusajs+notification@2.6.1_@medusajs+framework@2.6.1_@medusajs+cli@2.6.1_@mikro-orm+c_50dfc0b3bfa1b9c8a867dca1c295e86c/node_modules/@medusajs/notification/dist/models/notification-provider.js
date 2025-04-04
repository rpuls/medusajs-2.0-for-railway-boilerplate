"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProvider = void 0;
const utils_1 = require("@medusajs/framework/utils");
const notification_1 = require("./notification");
exports.NotificationProvider = utils_1.model.define("notificationProvider", {
    id: utils_1.model.id({ prefix: "notpro" }).primaryKey(),
    handle: utils_1.model.text(),
    name: utils_1.model.text(),
    is_enabled: utils_1.model.boolean().default(true),
    channels: utils_1.model.array().default([]),
    notifications: utils_1.model.hasMany(() => notification_1.Notification, { mappedBy: "provider" }),
});
//# sourceMappingURL=notification-provider.js.map