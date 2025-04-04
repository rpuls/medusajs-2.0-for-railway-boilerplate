"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationsStep = exports.sendNotificationsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.sendNotificationsStepId = "send-notifications";
/**
 * This step sends one or more notifications.
 */
exports.sendNotificationsStep = (0, workflows_sdk_1.createStep)(exports.sendNotificationsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.NOTIFICATION);
    const created = await service.createNotifications(data);
    return new workflows_sdk_1.StepResponse(created, created.map((notification) => notification.id));
}
// Most of the notifications are irreversible, so we can't compensate notifications reliably
);
//# sourceMappingURL=send-notifications.js.map