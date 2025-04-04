"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("./models");
const schema_1 = __importDefault(require("./schema"));
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.FULFILLMENT, {
    schema: schema_1.default,
    linkableKeys: {
        fulfillment_id: _models_1.Fulfillment.name,
        fulfillment_set_id: _models_1.FulfillmentSet.name,
        shipping_option_id: _models_1.ShippingOption.name,
        shipping_option_rule_id: _models_1.ShippingOptionRule.name,
        fulfillment_provider_id: _models_1.FulfillmentProvider.name,
    },
});
//# sourceMappingURL=joiner-config.js.map