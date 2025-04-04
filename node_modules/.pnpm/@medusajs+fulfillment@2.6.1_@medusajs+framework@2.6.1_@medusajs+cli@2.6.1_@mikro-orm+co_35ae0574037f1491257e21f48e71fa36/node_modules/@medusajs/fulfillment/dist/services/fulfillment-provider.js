"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FulfillmentProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
// TODO rework DTO's
class FulfillmentProviderService extends utils_1.ModulesSdkUtils.MedusaInternalService(_models_1.FulfillmentProvider) {
    constructor(container) {
        super(container);
        _FulfillmentProviderService_logger.set(this, void 0);
        this.fulfillmentProviderRepository_ =
            container.fulfillmentProviderRepository;
        __classPrivateFieldSet(this, _FulfillmentProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    static getRegistrationIdentifier(providerClass, optionName) {
        if (!providerClass.identifier) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, `Trying to register a fulfillment provider without an identifier.`);
        }
        return `${providerClass.identifier}_${optionName}`;
    }
    retrieveProviderRegistration(providerId) {
        try {
            return this.__container__[`fp_${providerId}`];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
Unable to retrieve the fulfillment provider with id: ${providerId}
Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the fulfillment provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _FulfillmentProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
    async listFulfillmentOptions(providerIds) {
        return await (0, utils_1.promiseAll)(providerIds.map(async (p) => {
            const provider = this.retrieveProviderRegistration(p);
            return {
                provider_id: p,
                options: (await provider.getFulfillmentOptions()),
            };
        }));
    }
    async getFulfillmentOptions(providerId) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.getFulfillmentOptions();
    }
    async validateFulfillmentData(providerId, optionData, data, context) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.validateFulfillmentData(optionData, data, context);
    }
    async validateOption(providerId, data) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.validateOption(data);
    }
    async canCalculate(providerId, data) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.canCalculate(data);
    }
    async calculatePrice(providerId, optionData, data, context) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.calculatePrice(optionData, data, context);
    }
    async createFulfillment(providerId, data, items, order, fulfillment) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.createFulfillment(data, items, order, fulfillment);
    }
    async cancelFulfillment(providerId, fulfillment) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.cancelFulfillment(fulfillment);
    }
    async createReturn(providerId, fulfillment) {
        const provider = this.retrieveProviderRegistration(providerId);
        return await provider.createReturnFulfillment(fulfillment);
    }
}
_FulfillmentProviderService_logger = new WeakMap();
exports.default = FulfillmentProviderService;
//# sourceMappingURL=fulfillment-provider.js.map