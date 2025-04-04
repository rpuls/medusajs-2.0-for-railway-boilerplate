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
const types_1 = require("@medusajs/framework/types");
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class StoreModuleService extends (0, utils_1.MedusaService)({ Store: _models_1.Store, StoreCurrency: _models_1.StoreCurrency }) {
    constructor({ baseRepository, storeService }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.storeService_ = storeService;
    }
    // @ts-expect-error
    async createStores(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const result = await this.create_(input, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0]);
    }
    async create_(data, sharedContext = {}) {
        let normalizedInput = StoreModuleService.normalizeInput(data);
        StoreModuleService.validateCreateRequest(normalizedInput);
        return (await this.storeService_.upsertWithReplace(normalizedInput, { relations: ["supported_currencies"] }, sharedContext)).entities;
    }
    async upsertStores(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const forUpdate = input.filter((store) => !!store.id);
        const forCreate = input.filter((store) => !store.id);
        const operations = [];
        if (forCreate.length) {
            operations.push(this.create_(forCreate, sharedContext));
        }
        if (forUpdate.length) {
            operations.push(this.update_(forUpdate, sharedContext));
        }
        const result = (await (0, utils_1.promiseAll)(operations)).flat();
        return await this.baseRepository_.serialize(Array.isArray(data) ? result : result[0]);
    }
    // @ts-expect-error
    async updateStores(idOrSelector, data, sharedContext = {}) {
        let normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            normalizedInput = [{ id: idOrSelector, ...data }];
        }
        else {
            const stores = await this.storeService_.list(idOrSelector, {}, sharedContext);
            normalizedInput = stores.map((store) => ({
                id: store.id,
                ...data,
            }));
        }
        const updateResult = await this.update_(normalizedInput, sharedContext);
        const stores = await this.baseRepository_.serialize(updateResult);
        return (0, utils_1.isString)(idOrSelector) ? stores[0] : stores;
    }
    async update_(data, sharedContext = {}) {
        const normalizedInput = StoreModuleService.normalizeInput(data);
        StoreModuleService.validateUpdateRequest(normalizedInput);
        return (await this.storeService_.upsertWithReplace(normalizedInput, { relations: ["supported_currencies"] }, sharedContext)).entities;
    }
    static normalizeInput(stores) {
        return stores.map((store) => (0, utils_1.removeUndefined)({
            ...store,
            supported_currencies: store.supported_currencies?.map((c) => ({
                ...c,
                currency_code: c.currency_code.toLowerCase(),
            })),
            name: store.name?.trim(),
        }));
    }
    static validateCreateRequest(stores) {
        for (const store of stores) {
            if (store.supported_currencies?.length) {
                const duplicates = (0, utils_1.getDuplicates)(store.supported_currencies?.map((c) => c.currency_code));
                if (duplicates.length) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Duplicate currency codes: ${duplicates.join(", ")}`);
                }
                let seenDefault = false;
                store.supported_currencies?.forEach((c) => {
                    if (c.is_default) {
                        if (seenDefault) {
                            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Only one default currency is allowed`);
                        }
                        seenDefault = true;
                    }
                });
                if (!seenDefault) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `There should be a default currency set for the store`);
                }
            }
        }
    }
    static validateUpdateRequest(stores) {
        StoreModuleService.validateCreateRequest(stores);
    }
}
exports.default = StoreModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StoreModuleService.prototype, "createStores", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StoreModuleService.prototype, "create_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StoreModuleService.prototype, "upsertStores", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StoreModuleService.prototype, "updateStores", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], StoreModuleService.prototype, "update_", null);
//# sourceMappingURL=store-module-service.js.map