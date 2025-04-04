"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const services_1 = require("./services");
const services = [
    services_1.StripeBancontactService,
    services_1.StripeBlikService,
    services_1.StripeGiropayService,
    services_1.StripeIdealService,
    services_1.StripeProviderService,
    services_1.StripePrzelewy24Service,
];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.PAYMENT, {
    services,
});
//# sourceMappingURL=index.js.map