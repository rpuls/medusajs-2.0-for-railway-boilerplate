"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyOnFailureStep = exports.notifyOnFailureStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.notifyOnFailureStepId = "notify-on-failure";
/**
 * This step sends one or more notification when a workflow fails. This
 * step can be used in the beginning of a workflow so that, when the workflow fails,
 * the step's compensation function is triggered to send the notification.
 *
 * @example
 * const data = notifyOnFailureStep([{
 *   to: "example@gmail.com",
 *   channel: "email",
 *   template: "order-failed",
 *   data: {
 *     order_id: "order_123",
 *   }
 * }])
 */
exports.notifyOnFailureStep = (0, workflows_sdk_1.createStep)(exports.notifyOnFailureStepId, async (data) => {
    return new workflows_sdk_1.StepResponse(void 0, data);
}, async (data, { container }) => {
    if (!data) {
        return;
    }
    const service = container.resolve(utils_1.Modules.NOTIFICATION);
    await service.createNotifications(data);
});
//# sourceMappingURL=notify-on-failure.js.map