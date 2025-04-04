import { LocalNotificationServiceOptions, Logger, NotificationTypes } from "@medusajs/framework/types";
import { AbstractNotificationProviderService } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface LocalServiceConfig {
}
export declare class LocalNotificationService extends AbstractNotificationProviderService {
    static identifier: string;
    protected config_: LocalServiceConfig;
    protected logger_: Logger;
    constructor({ logger }: InjectedDependencies, options: LocalNotificationServiceOptions);
    send(notification: NotificationTypes.ProviderSendNotificationDTO): Promise<NotificationTypes.ProviderSendNotificationResultsDTO>;
}
export {};
//# sourceMappingURL=local.d.ts.map