"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_base_1 = __importDefault(require("../core/stripe-base"));
const types_1 = require("../types");
class Przelewy24ProviderService extends stripe_base_1.default {
    constructor(_, options) {
        super(_, options);
    }
    get paymentIntentOptions() {
        return {
            payment_method_types: ["p24"],
            capture_method: "automatic",
        };
    }
}
Przelewy24ProviderService.identifier = types_1.PaymentProviderKeys.PRZELEWY_24;
exports.default = Przelewy24ProviderService;
//# sourceMappingURL=stripe-przelewy24.js.map