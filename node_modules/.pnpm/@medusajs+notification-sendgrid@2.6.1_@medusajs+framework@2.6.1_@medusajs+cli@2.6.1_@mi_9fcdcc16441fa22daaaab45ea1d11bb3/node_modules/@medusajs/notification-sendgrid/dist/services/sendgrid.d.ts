import { Logger, NotificationTypes, SendgridNotificationServiceOptions } from "@medusajs/framework/types";
import { AbstractNotificationProviderService } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface SendgridServiceConfig {
    apiKey: string;
    from: string;
}
export declare class SendgridNotificationService extends AbstractNotificationProviderService {
    static identifier: string;
    protected config_: SendgridServiceConfig;
    protected logger_: Logger;
    constructor({ logger }: InjectedDependencies, options: SendgridNotificationServiceOptions);
    send(notification: NotificationTypes.ProviderSendNotificationDTO): Promise<NotificationTypes.ProviderSendNotificationResultsDTO>;
}
export {};
//# sourceMappingURL=sendgrid.d.ts.map