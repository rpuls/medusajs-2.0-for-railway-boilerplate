"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_base_1 = __importDefault(require("../core/stripe-base"));
const types_1 = require("../types");
class BancontactProviderService extends stripe_base_1.default {
    constructor(_, options) {
        super(_, options);
    }
    get paymentIntentOptions() {
        return {
            payment_method_types: ["bancontact"],
            capture_method: "automatic",
        };
    }
}
BancontactProviderService.identifier = types_1.PaymentProviderKeys.BAN_CONTACT;
exports.default = BancontactProviderService;
//# sourceMappingURL=stripe-bancontact.js.map