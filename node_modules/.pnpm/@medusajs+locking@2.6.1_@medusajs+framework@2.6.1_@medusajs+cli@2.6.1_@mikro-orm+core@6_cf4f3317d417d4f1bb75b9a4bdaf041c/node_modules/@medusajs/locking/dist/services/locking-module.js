"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _types_1 = require("../types");
class LockingModuleService {
    constructor(container, moduleDeclaration) {
        this.moduleDeclaration = moduleDeclaration;
        this.manager = container.manager;
        this.providerService_ = container.lockingProviderService;
        this.defaultProviderId = container[_types_1.LockingDefaultProvider];
    }
    async execute(keys, job, args, sharedContext = {}) {
        const providerId = args?.provider ?? this.defaultProviderId;
        const provider = this.providerService_.retrieveProviderRegistration(providerId);
        return provider.execute(keys, job, args, sharedContext);
    }
    async acquire(keys, args, sharedContext = {}) {
        const providerId = args?.provider ?? this.defaultProviderId;
        const provider = this.providerService_.retrieveProviderRegistration(providerId);
        await provider.acquire(keys, args, sharedContext);
    }
    async release(keys, args, sharedContext = {}) {
        const providerId = args?.provider ?? this.defaultProviderId;
        const provider = this.providerService_.retrieveProviderRegistration(providerId);
        return await provider.release(keys, args, sharedContext);
    }
    async releaseAll(args, sharedContext = {}) {
        const providerId = args?.provider ?? this.defaultProviderId;
        const provider = this.providerService_.retrieveProviderRegistration(providerId);
        return await provider.releaseAll(args, sharedContext);
    }
}
exports.default = LockingModuleService;
//# sourceMappingURL=locking-module.js.map