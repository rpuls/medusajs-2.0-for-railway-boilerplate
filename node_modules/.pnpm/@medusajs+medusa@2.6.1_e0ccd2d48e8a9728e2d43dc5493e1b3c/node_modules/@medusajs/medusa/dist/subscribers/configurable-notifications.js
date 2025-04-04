"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = configurableNotifications;
const utils_1 = require("@medusajs/framework/utils");
const lodash_1 = require("lodash");
// TODO: The config should be loaded dynamically from medusa-config.js
// TODO: We can use a more powerful templating syntax to allow for eg. combining fields.
const handlerConfig = [
    {
        event: "order.created",
        template: "order-created-template",
        channel: "email",
        to: "order.email",
        resource_id: "order.id",
        data: {
            order_id: "order.id",
        },
    },
];
const configAsMap = handlerConfig.reduce((acc, h) => {
    if (!acc[h.event]) {
        acc[h.event] = [];
    }
    acc[h.event].push(h);
    return acc;
}, {});
async function configurableNotifications({ event, container, }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const notificationService = container.resolve(utils_1.Modules.NOTIFICATION);
    const handlers = configAsMap[event.name] ?? [];
    const payload = event.data;
    await (0, utils_1.promiseAll)(handlers.map(async (handler) => {
        const notificationData = {
            template: handler.template,
            channel: handler.channel,
            to: (0, lodash_1.get)(payload, handler.to),
            trigger_type: handler.event,
            resource_id: (0, lodash_1.get)(payload, handler.resource_id),
            data: Object.entries(handler.data).reduce((acc, [key, value]) => {
                acc[key] = (0, lodash_1.get)(payload, value);
                return acc;
            }, {}),
        };
        // We don't want to fail all handlers, so we catch and log errors only
        try {
            await notificationService.createNotifications(notificationData);
        }
        catch (err) {
            logger.error(`Failed to send notification for ${event.name}`, err.message);
        }
    }));
}
exports.config = {
    event: handlerConfig.map((h) => h.event),
    context: {
        subscriberId: "configurable-notifications-handler",
    },
};
//# sourceMappingURL=configurable-notifications.js.map