"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_base_1 = __importDefault(require("../core/stripe-base"));
const types_1 = require("../types");
class StripeProviderService extends stripe_base_1.default {
    constructor(_, options) {
        super(_, options);
    }
    get paymentIntentOptions() {
        return {};
    }
}
StripeProviderService.identifier = types_1.PaymentProviderKeys.STRIPE;
exports.default = StripeProviderService;
//# sourceMappingURL=stripe-provider.js.map