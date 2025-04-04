"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentProvider = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.FulfillmentProvider = utils_1.model.define("fulfillment_provider", {
    id: utils_1.model.id({ prefix: "serpro" }).primaryKey(),
    is_enabled: utils_1.model.boolean().default(true),
});
//# sourceMappingURL=fulfillment-provider.js.map