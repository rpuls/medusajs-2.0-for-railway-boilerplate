import { Context, DAL, InferEntityType, INotificationModuleService, InternalModuleDeclaration, Logger, ModulesSdkTypes, NotificationTypes } from "@medusajs/framework/types";
import { Notification } from "../models";
import NotificationProviderService from "./notification-provider";
type InjectedDependencies = {
    logger?: Logger;
    baseRepository: DAL.RepositoryService;
    notificationService: ModulesSdkTypes.IMedusaInternalService<typeof Notification>;
    notificationProviderService: NotificationProviderService;
};
declare const NotificationModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    Notification: {
        dto: NotificationTypes.NotificationDTO;
    };
}>;
export default class NotificationModuleService extends NotificationModuleService_base implements INotificationModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly notificationService_: ModulesSdkTypes.IMedusaInternalService<typeof Notification>;
    protected readonly notificationProviderService_: NotificationProviderService;
    constructor({ baseRepository, notificationService, notificationProviderService, }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    createNotifications(data: NotificationTypes.CreateNotificationDTO[], sharedContext?: Context): Promise<NotificationTypes.NotificationDTO[]>;
    createNotifications(data: NotificationTypes.CreateNotificationDTO, sharedContext?: Context): Promise<NotificationTypes.NotificationDTO>;
    protected createNotifications_(data: NotificationTypes.CreateNotificationDTO[], sharedContext?: Context): Promise<InferEntityType<typeof Notification>[]>;
}
export {};
//# sourceMappingURL=notification-module-service.d.ts.map