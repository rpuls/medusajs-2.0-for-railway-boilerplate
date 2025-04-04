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
const joinfer_config_1 = require("../joinfer-config");
class SalesChannelModuleService extends (0, utils_1.MedusaService)({
    SalesChannel: _models_1.SalesChannel,
}) {
    constructor({ baseRepository, salesChannelService }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.salesChannelService_ = salesChannelService;
    }
    __joinerConfig() {
        return joinfer_config_1.joinerConfig;
    }
    // @ts-expect-error
    async createSalesChannels(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const result = await this.createSalesChannels_(input, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0], {
            populate: true,
        });
    }
    async createSalesChannels_(data, sharedContext) {
        return await this.salesChannelService_.create(data, sharedContext);
    }
    // @ts-expect-error
    async updateSalesChannels(idOrSelector, data, sharedContext = {}) {
        let normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            normalizedInput = [{ id: idOrSelector, ...data }];
        }
        else {
            const channels = await this.salesChannelService_.list(idOrSelector, {}, sharedContext);
            normalizedInput = channels.map((channel) => ({
                id: channel.id,
                ...data,
            }));
        }
        const result = await this.updateSalesChannels_(normalizedInput, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0], {
            populate: true,
        });
    }
    async updateSalesChannels_(data, sharedContext) {
        return await this.salesChannelService_.update(data, sharedContext);
    }
    async upsertSalesChannels(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const forUpdate = input.filter((channel) => !!channel.id);
        const forCreate = input.filter((channel) => !channel.id);
        const operations = [];
        if (forCreate.length) {
            operations.push(this.createSalesChannels_(forCreate, sharedContext));
        }
        if (forUpdate.length) {
            operations.push(this.updateSalesChannels_(forUpdate, sharedContext));
        }
        const result = (await (0, utils_1.promiseAll)(operations)).flat();
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0]);
    }
}
exports.default = SalesChannelModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SalesChannelModuleService.prototype, "createSalesChannels", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], SalesChannelModuleService.prototype, "createSalesChannels_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SalesChannelModuleService.prototype, "updateSalesChannels", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], SalesChannelModuleService.prototype, "updateSalesChannels_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SalesChannelModuleService.prototype, "upsertSalesChannels", null);
//# sourceMappingURL=sales-channel-module.js.map