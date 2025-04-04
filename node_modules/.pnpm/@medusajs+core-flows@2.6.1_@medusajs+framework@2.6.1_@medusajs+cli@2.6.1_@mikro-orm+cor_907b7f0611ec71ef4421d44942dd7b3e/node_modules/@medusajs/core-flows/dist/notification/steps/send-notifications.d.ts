/**
 * The notifications to send.
 */
export type SendNotificationsStepInput = {
    /**
     * The address to send the notification to, depending on
     * the channel. For example, the email address for the email channel.
     */
    to: string;
    /**
     * The channel to send the notification through. For example, `email`.
     */
    channel: string;
    /**
     * The ID of the template to use for the notification. This template ID may be defined
     * in a third-party service used to send the notification.
     */
    template: string;
    /**
     * The data to use in the notification template. This data may be used to personalize
     * the notification, such as the user's name or the order number.
     */
    data?: Record<string, unknown> | null;
    /**
     * The type of trigger that caused the notification to be sent. For example, `order_created`.
     */
    trigger_type?: string | null;
    /**
     * The ID of the resource that triggered the notification. For example, the ID of the order
     * that triggered the notification.
     */
    resource_id?: string | null;
    /**
     * The type of the resource that triggered the notification. For example, `order`.
     */
    resource_type?: string | null;
    /**
     * The ID of the user receiving the notification.
     */
    receiver_id?: string | null;
    /**
     * The ID of the original notification if it's being resent.
     */
    original_notification_id?: string | null;
    /**
     * A key to ensure that the notification is sent only once. If the notification
     * is sent multiple times, the key ensures that the notification is sent only once.
     */
    idempotency_key?: string | null;
}[];
export declare const sendNotificationsStepId = "send-notifications";
/**
 * This step sends one or more notifications.
 */
export declare const sendNotificationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<SendNotificationsStepInput, import("@medusajs/framework/types").NotificationDTO[]>;
//# sourceMappingURL=send-notifications.d.ts.map