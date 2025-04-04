"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const manual_fulfillment_1 = require("./services/manual-fulfillment");
const services = [manual_fulfillment_1.ManualFulfillmentService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.FULFILLMENT, {
    services,
});
//# sourceMappingURL=index.js.map