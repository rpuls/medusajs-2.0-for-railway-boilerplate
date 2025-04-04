"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalNotificationService = void 0;
const utils_1 = require("@medusajs/framework/utils");
class LocalNotificationService extends utils_1.AbstractNotificationProviderService {
    constructor({ logger }, options) {
        super();
        this.config_ = options;
        this.logger_ = logger;
    }
    async send(notification) {
        if (!notification) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No notification information provided`);
        }
        const message = `Attempting to send a notification to: '${notification.to}'` +
            ` on the channel: '${notification.channel}' with template: '${notification.template}'` +
            ` and data: '${JSON.stringify(notification.data)}'`;
        this.logger_.info(message);
        return {};
    }
}
exports.LocalNotificationService = LocalNotificationService;
LocalNotificationService.identifier = "notification-local";
//# sourceMappingURL=local.js.map