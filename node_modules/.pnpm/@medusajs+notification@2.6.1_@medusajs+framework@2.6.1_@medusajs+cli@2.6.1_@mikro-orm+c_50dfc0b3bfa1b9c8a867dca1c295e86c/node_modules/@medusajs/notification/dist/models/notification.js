"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const utils_1 = require("@medusajs/framework/utils");
const notification_provider_1 = require("./notification-provider");
// We probably want to have a TTL for each entry, so we don't bloat the DB (and also for GDPR reasons if TTL < 30 days).
exports.Notification = utils_1.model.define("notification", {
    id: utils_1.model.id({ prefix: "noti" }).primaryKey(),
    // This can be an email, phone number, or username, depending on the channel.
    to: utils_1.model.text().searchable(),
    channel: utils_1.model.text(),
    // The template name in the provider's system.
    template: utils_1.model.text(),
    // The data that gets passed over to the provider for rendering the notification.
    data: utils_1.model.json().nullable(),
    // This can be the event name, the workflow, or anything else that can help to identify what triggered the notification.
    trigger_type: utils_1.model.text().nullable(),
    // The ID of the resource this notification is for, if applicable. Useful for displaying relevant information in the UI
    resource_id: utils_1.model.text().searchable().nullable(),
    // The typeame of the resource this notification is for, if applicable, eg. "order"
    resource_type: utils_1.model.text().nullable(),
    // The ID of the receiver of the notification, if applicable. This can be a customer, user, a company, or anything else.
    receiver_id: utils_1.model.text().index().nullable(),
    // The original notification, in case this is a retried notification.
    original_notification_id: utils_1.model.text().nullable(),
    idempotency_key: utils_1.model.text().unique().nullable(),
    // The ID of the notification in the external system, if applicable
    external_id: utils_1.model.text().nullable(),
    // The status of the notification
    status: utils_1.model.enum(utils_1.NotificationStatus).default(utils_1.NotificationStatus.PENDING),
    provider: utils_1.model
        .belongsTo(() => notification_provider_1.NotificationProvider, { mappedBy: "notifications" })
        .nullable(),
});
//# sourceMappingURL=notification.js.map