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
const joiner_config_1 = require("../joiner-config");
const models_1 = require("../models");
/**
 * Service for managing stock locations.
 */
class StockLocationModuleService extends (0, utils_1.MedusaService)({ StockLocation: models_1.StockLocation, StockLocationAddress: models_1.StockLocationAddress }) {
    constructor({ [utils_1.Modules.EVENT_BUS]: eventBusModuleService, baseRepository, stockLocationService, stockLocationAddressService, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.stockLocationService_ = stockLocationService;
        this.stockLocationAddressService_ = stockLocationAddressService;
        this.eventBusModuleService_ = eventBusModuleService;
    }
    __joinerConfig() {
        return joiner_config_1.joinerConfig;
    }
    // @ts-expect-error
    async createStockLocations(data, context = {}) {
        const input = Array.isArray(data) ? data : [data];
        const created = await this.createStockLocations_(input, context);
        const serialized = await this.baseRepository_.serialize(created, { populate: true });
        return Array.isArray(data) ? serialized : serialized[0];
    }
    async createStockLocations_(data, context = {}) {
        return await this.stockLocationService_.create(data, context);
    }
    async upsertStockLocations(data, context = {}) {
        const input = Array.isArray(data) ? data : [data];
        const result = await this.upsertStockLocations_(input, context);
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0]);
    }
    async upsertStockLocations_(input, context = {}) {
        const toUpdate = input.filter((location) => !!location.id);
        const toCreate = input.filter((location) => !location.id);
        const operations = [];
        if (toCreate.length) {
            operations.push(this.createStockLocations_(toCreate, context));
        }
        if (toUpdate.length) {
            operations.push(this.updateStockLocations_(toUpdate, context));
        }
        return (await (0, utils_1.promiseAll)(operations)).flat();
    }
    /**
     * Updates an existing stock location.
     * @param stockLocationId - The ID of the stock location to update.
     * @param updateData - The update data for the stock location.
     * @param context
     * @returns The updated stock location.
     */
    // @ts-expect-error
    async updateStockLocations(idOrSelector, data, context = {}) {
        let normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            normalizedInput = [{ id: idOrSelector, ...data }];
        }
        else {
            normalizedInput = { data, selector: idOrSelector };
        }
        const updated = await this.updateStockLocations_(normalizedInput, context);
        const serialized = await this.baseRepository_.serialize(updated, { populate: true });
        return Array.isArray(data) ? serialized : serialized[0];
    }
    async updateStockLocations_(data, context = {}) {
        return await this.stockLocationService_.update(data, context);
    }
    // @ts-expect-error
    async updateStockLocationAddresses(data, context = {}) {
        const input = Array.isArray(data) ? data : [data];
        const updated = await this.updateStockLocationAddresses_(input, context);
        const serialized = await this.baseRepository_.serialize(updated, { populate: true });
        return Array.isArray(data) ? serialized : serialized[0];
    }
    async updateStockLocationAddresses_(input, context) {
        return await this.stockLocationAddressService_.update(input, context);
    }
    async upsertStockLocationAddresses(data, context = {}) {
        const input = Array.isArray(data) ? data : [data];
        const result = await this.upsertStockLocationAddresses_(input, context);
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0]);
    }
    async upsertStockLocationAddresses_(input, context = {}) {
        const toUpdate = input.filter((location) => !!location.id);
        const toCreate = input.filter((location) => !location.id);
        const operations = [];
        if (toCreate.length) {
            operations.push(this.stockLocationAddressService_.create(toCreate, context));
        }
        if (toUpdate.length) {
            operations.push(this.stockLocationAddressService_.update(toUpdate, context));
        }
        return (await (0, utils_1.promiseAll)(operations)).flat();
    }
}
exports.default = StockLocationModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "createStockLocations", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "createStockLocations_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "upsertStockLocations", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "upsertStockLocations_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "updateStockLocations", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "updateStockLocations_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "updateStockLocationAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "updateStockLocationAddresses_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "upsertStockLocationAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StockLocationModuleService.prototype, "upsertStockLocationAddresses_", null);
//# sourceMappingURL=stock-location-module.js.map