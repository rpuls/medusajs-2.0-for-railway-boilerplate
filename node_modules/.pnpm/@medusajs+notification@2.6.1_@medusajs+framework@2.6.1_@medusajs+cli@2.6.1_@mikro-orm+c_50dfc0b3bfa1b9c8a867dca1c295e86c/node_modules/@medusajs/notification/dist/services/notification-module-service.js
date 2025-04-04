"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const _utils_1 = require("../utils");
class NotificationModuleService extends (0, utils_1.MedusaService)({ Notification: _models_1.Notification }) {
    constructor({ baseRepository, notificationService, notificationProviderService, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.notificationService_ = notificationService;
        this.notificationProviderService_ = notificationProviderService;
    }
    // @ts-expect-error
    async createNotifications(data, sharedContext = {}) {
        const normalized = Array.isArray(data) ? data : [data];
        const createdNotifications = await this.createNotifications_(normalized, sharedContext);
        const serialized = await this.baseRepository_.serialize(createdNotifications);
        _utils_1.eventBuilders.createdNotification({
            data: serialized,
            sharedContext,
        });
        return Array.isArray(data) ? serialized : serialized[0];
    }
    async createNotifications_(data, sharedContext = {}) {
        if (!data.length) {
            return [];
        }
        // TODO: At this point we should probably take a lock with the idempotency keys so we don't have race conditions.
        // Also, we should probably rely on Redis for this instead of the database.
        const idempotencyKeys = data
            .map((entry) => entry.idempotency_key)
            .filter(Boolean);
        let { notificationsToProcess, createdNotifications } = await this.baseRepository_.transaction(async (txManager) => {
            const context = {
                ...sharedContext,
                transactionManager: txManager,
            };
            const alreadySentNotifications = await this.notificationService_.list({
                idempotency_key: idempotencyKeys,
            }, {}, context);
            const existsMap = new Map(alreadySentNotifications.map((n) => [n.idempotency_key, n]));
            const notificationsToProcess = data.filter((entry) => !entry.idempotency_key ||
                !existsMap.has(entry.idempotency_key) ||
                (existsMap.has(entry.idempotency_key) &&
                    existsMap.get(entry.idempotency_key).status ===
                        utils_1.NotificationStatus.FAILURE));
            const channels = notificationsToProcess.map((not) => not.channel);
            const providers = await this.notificationProviderService_.getProviderForChannels(channels);
            // Create the notifications to be sent to prevent concurrent actions listing the same notifications
            const normalizedNotificationsToProcess = notificationsToProcess.map((entry) => {
                const provider = providers.find((provider) => provider?.channels.includes(entry.channel));
                return {
                    provider,
                    data: {
                        id: (0, utils_1.generateEntityId)(undefined, "noti"),
                        ...entry,
                        provider_id: provider?.id,
                    },
                };
            });
            const toCreate = normalizedNotificationsToProcess
                .filter((e) => !e.data.idempotency_key || !existsMap.has(e.data.idempotency_key))
                .map((e) => e.data);
            const createdNotifications = toCreate.length
                ? await this.notificationService_.create(toCreate, context)
                : [];
            return {
                notificationsToProcess: normalizedNotificationsToProcess,
                createdNotifications,
            };
        });
        const notificationToUpdate = [];
        try {
            await (0, utils_1.promiseAll)(notificationsToProcess.map(async (entry) => {
                const provider = entry.provider;
                if (!provider?.is_enabled) {
                    entry.data.status = utils_1.NotificationStatus.FAILURE;
                    notificationToUpdate.push(entry.data);
                    const errorMessage = !provider
                        ? `Could not find a notification provider for channel: ${entry.data.channel} for notification id ${entry.data.id}`
                        : `Notification provider ${provider.id} is not enabled. To enable it, configure it as a provider in the notification module options.`;
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, errorMessage);
                }
                const res = await this.notificationProviderService_
                    .send(provider, entry.data)
                    .catch((e) => {
                    entry.data.status = utils_1.NotificationStatus.FAILURE;
                    notificationToUpdate.push(entry.data);
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, `Failed to send notification with id ${entry.data.id}:\n${e.message}`);
                });
                entry.data.external_id = res.id;
                entry.data.status = utils_1.NotificationStatus.SUCCESS;
                notificationToUpdate.push(entry.data);
            }), {
                aggregateErrors: true,
            });
        }
        finally {
            const updatedNotifications = await this.notificationService_.update(notificationToUpdate, sharedContext);
            const updatedNotificationsMap = new Map(updatedNotifications.map((n) => [n.id, n]));
            // Maintain the order of the notifications
            createdNotifications = createdNotifications.map((notification) => {
                return updatedNotificationsMap.get(notification.id) || notification;
            });
        }
        return createdNotifications;
    }
}
exports.default = NotificationModuleService;
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationModuleService.prototype, "createNotifications", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], NotificationModuleService.prototype, "createNotifications_", null);
//# sourceMappingURL=notification-module-service.js.map