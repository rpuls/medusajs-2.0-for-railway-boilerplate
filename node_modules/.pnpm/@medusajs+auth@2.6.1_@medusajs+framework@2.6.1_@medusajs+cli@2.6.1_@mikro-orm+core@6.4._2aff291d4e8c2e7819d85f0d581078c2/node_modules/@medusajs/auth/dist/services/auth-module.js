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
const joiner_config_1 = require("../joiner-config");
class AuthModuleService extends (0, utils_1.MedusaService)({ AuthIdentity: _models_1.AuthIdentity, ProviderIdentity: _models_1.ProviderIdentity }) {
    constructor({ authIdentityService, providerIdentityService, authProviderService, baseRepository, cache, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.authIdentityService_ = authIdentityService;
        this.authProviderService_ = authProviderService;
        this.providerIdentityService_ = providerIdentityService;
        this.cache_ = cache;
    }
    __joinerConfig() {
        return joiner_config_1.joinerConfig;
    }
    async createAuthIdentities(data, sharedContext = {}) {
        const authIdentities = await this.authIdentityService_.create(data, sharedContext);
        return await this.baseRepository_.serialize(authIdentities, {
            populate: true,
        });
    }
    // @ts-expect-error
    async updateAuthIdentities(data, sharedContext = {}) {
        const updatedUsers = await this.authIdentityService_.update(data, sharedContext);
        const serializedUsers = await this.baseRepository_.serialize(updatedUsers, {
            populate: true,
        });
        return Array.isArray(data) ? serializedUsers : serializedUsers[0];
    }
    async register(provider, authenticationData) {
        try {
            return await this.authProviderService_.register(provider, authenticationData, this.getAuthIdentityProviderService(provider));
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    // @ts-expect-error
    async createProviderIdentities(data, sharedContext = {}) {
        const providerIdentities = await this.providerIdentityService_.create(data, sharedContext);
        return await this.baseRepository_.serialize(providerIdentities);
    }
    // @ts-expect-error
    async updateProviderIdentities(data, sharedContext = {}) {
        const updatedProviders = await this.providerIdentityService_.update(data, sharedContext);
        const serializedProviders = await this.baseRepository_.serialize(updatedProviders);
        return Array.isArray(data) ? serializedProviders : serializedProviders[0];
    }
    async updateProvider(provider, data) {
        try {
            return await this.authProviderService_.update(provider, data, this.getAuthIdentityProviderService(provider));
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async authenticate(provider, authenticationData) {
        try {
            return await this.authProviderService_.authenticate(provider, authenticationData, this.getAuthIdentityProviderService(provider));
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async validateCallback(provider, authenticationData) {
        try {
            return await this.authProviderService_.validateCallback(provider, authenticationData, this.getAuthIdentityProviderService(provider));
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    getAuthIdentityProviderService(provider) {
        return {
            retrieve: async ({ entity_id }) => {
                const authIdentities = await this.authIdentityService_.list({
                    provider_identities: {
                        entity_id,
                        provider,
                    },
                }, {
                    relations: ["provider_identities"],
                });
                if (!authIdentities.length) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `AuthIdentity with entity_id "${entity_id}" not found`);
                }
                if (authIdentities.length > 1) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Multiple authIdentities found for entity_id "${entity_id}"`);
                }
                return await this.baseRepository_.serialize(authIdentities[0]);
            },
            create: async (data) => {
                const normalizedRequest = {
                    provider_identities: [
                        {
                            entity_id: data.entity_id,
                            provider_metadata: data.provider_metadata,
                            user_metadata: data.user_metadata,
                            provider,
                        },
                    ],
                };
                const createdAuthIdentity = await this.authIdentityService_.create(normalizedRequest);
                return await this.baseRepository_.serialize(createdAuthIdentity);
            },
            update: async (entity_id, data) => {
                const authIdentities = await this.authIdentityService_.list({
                    provider_identities: {
                        entity_id,
                        provider,
                    },
                }, {
                    relations: ["provider_identities"],
                });
                if (!authIdentities.length) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `AuthIdentity with entity_id "${entity_id}" not found`);
                }
                if (authIdentities.length > 1) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Multiple authIdentities found for entity_id "${entity_id}"`);
                }
                const providerIdentityData = authIdentities[0].provider_identities.find((pi) => pi.provider === provider);
                if (!providerIdentityData) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `ProviderIdentity with entity_id "${entity_id}" not found`);
                }
                const updatedProviderIdentity = await this.providerIdentityService_.update({
                    id: providerIdentityData.id,
                    ...data,
                });
                const serializedResponse = await this.baseRepository_.serialize(authIdentities[0]);
                const serializedProviderIdentity = await this.baseRepository_.serialize(updatedProviderIdentity);
                serializedResponse.provider_identities = [
                    ...(serializedResponse.provider_identities?.filter((p) => p.provider !== provider) ?? []),
                    serializedProviderIdentity,
                ];
                return serializedResponse;
            },
            setState: async (key, value) => {
                if (!this.cache_) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Cache module dependency is required when using OAuth providers that require state");
                }
                // 20 minutes. Can be made configurable if necessary, but this is a good default.
                this.cache_.set(key, value, 1200);
            },
            getState: async (key) => {
                if (!this.cache_) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Cache module dependency is required when using OAuth providers that require state");
                }
                return await this.cache_.get(key);
            },
        };
    }
}
exports.default = AuthModuleService;
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthModuleService.prototype, "createAuthIdentities", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthModuleService.prototype, "updateAuthIdentities", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthModuleService.prototype, "createProviderIdentities", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthModuleService.prototype, "updateProviderIdentities", null);
//# sourceMappingURL=auth-module.js.map