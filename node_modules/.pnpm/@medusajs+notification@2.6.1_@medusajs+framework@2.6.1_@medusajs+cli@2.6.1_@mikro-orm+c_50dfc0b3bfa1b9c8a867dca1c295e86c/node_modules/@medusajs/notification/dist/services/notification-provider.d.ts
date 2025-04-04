import { DAL, InferEntityType, Logger, NotificationTypes } from "@medusajs/framework/types";
import { NotificationProvider } from "../models";
import { NotificationProviderRegistrationPrefix } from "../types";
type InjectedDependencies = {
    logger?: Logger;
    notificationProviderRepository: DAL.RepositoryService<InferEntityType<typeof NotificationProvider>>;
    [key: `${typeof NotificationProviderRegistrationPrefix}${string}`]: NotificationTypes.INotificationProvider;
};
type Provider = InferEntityType<typeof NotificationProvider>;
declare const NotificationProviderService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    handle: import("@medusajs/framework/utils").TextProperty;
    name: import("@medusajs/framework/utils").TextProperty;
    is_enabled: import("@medusajs/framework/utils").BooleanProperty;
    channels: import("@medusajs/framework/utils").ArrayProperty;
    notifications: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        to: import("@medusajs/framework/utils").TextProperty;
        channel: import("@medusajs/framework/utils").TextProperty;
        template: import("@medusajs/framework/utils").TextProperty;
        data: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
        trigger_type: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        resource_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        resource_type: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        receiver_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        original_notification_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        idempotency_key: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        external_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        status: import("@medusajs/framework/utils").EnumProperty<typeof import("@medusajs/framework/utils").NotificationStatus>;
        provider: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "notificationProvider">, import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "notificationProvider">, undefined>, true>;
    }>, "notification">>;
}>, "notificationProvider">, InjectedDependencies>;
export default class NotificationProviderService extends NotificationProviderService_base {
    #private;
    protected readonly notificationProviderRepository_: DAL.RepositoryService<InferEntityType<typeof NotificationProvider>>;
    protected providersCache: Map<string, InferEntityType<typeof NotificationProvider>>;
    constructor(container: InjectedDependencies);
    protected retrieveProviderRegistration(providerId: string): NotificationTypes.INotificationProvider;
    getProviderForChannels<TChannel = string | string[], TOutput = TChannel extends string[] ? Provider[] : Provider | undefined>(channels: TChannel): Promise<TOutput>;
    send(provider: InferEntityType<typeof NotificationProvider>, notification: NotificationTypes.ProviderSendNotificationDTO): Promise<NotificationTypes.ProviderSendNotificationResultsDTO>;
}
export {};
//# sourceMappingURL=notification-provider.d.ts.map