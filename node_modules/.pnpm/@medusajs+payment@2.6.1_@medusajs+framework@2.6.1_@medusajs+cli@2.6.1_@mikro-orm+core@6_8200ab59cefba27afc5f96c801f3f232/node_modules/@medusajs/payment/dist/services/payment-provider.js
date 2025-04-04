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
var _PaymentProviderService_logger;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class PaymentProviderService extends utils_1.ModulesSdkUtils.MedusaInternalService(_models_1.PaymentProvider) {
    constructor(container) {
        super(container);
        _PaymentProviderService_logger.set(this, void 0);
        __classPrivateFieldSet(this, _PaymentProviderService_logger, container["logger"]
            ? container.logger
            : console, "f");
    }
    retrieveProvider(providerId) {
        try {
            return this.__container__[providerId];
        }
        catch (err) {
            if (err.name === "AwilixResolutionError") {
                const errMessage = `
Unable to retrieve the payment provider with id: ${providerId}
Please make sure that the provider is registered in the container and it is configured correctly in your project configuration file.`;
                throw new Error(errMessage);
            }
            const errMessage = `Unable to retrieve the payment provider with id: ${providerId}, the following error occurred: ${err.message}`;
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").error(errMessage);
            throw new Error(errMessage);
        }
    }
    async createSession(providerId, sessionInput) {
        const provider = this.retrieveProvider(providerId);
        return await provider.initiatePayment(sessionInput);
    }
    async updateSession(providerId, sessionInput) {
        const provider = this.retrieveProvider(providerId);
        return await provider.updatePayment(sessionInput);
    }
    async deleteSession(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.deletePayment(input);
    }
    async authorizePayment(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.authorizePayment(input);
    }
    async getStatus(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.getPaymentStatus(input);
    }
    async capturePayment(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.capturePayment(input);
    }
    async cancelPayment(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.cancelPayment(input);
    }
    async refundPayment(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        return await provider.refundPayment(input);
    }
    async createAccountHolder(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        if (!provider.createAccountHolder) {
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").warn(`Provider ${providerId} does not support creating account holders`);
            return {};
        }
        return await provider.createAccountHolder(input);
    }
    async updateAccountHolder(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        if (!provider.updateAccountHolder) {
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").warn(`Provider ${providerId} does not support updating account holders`);
            return {};
        }
        return await provider.updateAccountHolder(input);
    }
    async deleteAccountHolder(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        if (!provider.deleteAccountHolder) {
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").warn(`Provider ${providerId} does not support deleting account holders`);
            return {};
        }
        return await provider.deleteAccountHolder(input);
    }
    async listPaymentMethods(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        if (!provider.listPaymentMethods) {
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").warn(`Provider ${providerId} does not support listing payment methods`);
            return [];
        }
        return await provider.listPaymentMethods(input);
    }
    async savePaymentMethod(providerId, input) {
        const provider = this.retrieveProvider(providerId);
        if (!provider.savePaymentMethod) {
            __classPrivateFieldGet(this, _PaymentProviderService_logger, "f").warn(`Provider ${providerId} does not support saving payment methods`);
            return {};
        }
        return await provider.savePaymentMethod(input);
    }
    async getWebhookActionAndData(providerId, data) {
        const provider = this.retrieveProvider(providerId);
        return await provider.getWebhookActionAndData(data);
    }
}
_PaymentProviderService_logger = new WeakMap();
exports.default = PaymentProviderService;
//# sourceMappingURL=payment-provider.js.map