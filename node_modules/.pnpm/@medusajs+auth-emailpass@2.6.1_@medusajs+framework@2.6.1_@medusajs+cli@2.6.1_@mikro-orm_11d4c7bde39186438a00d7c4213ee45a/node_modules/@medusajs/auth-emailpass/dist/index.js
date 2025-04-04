"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const emailpass_1 = require("./services/emailpass");
const services = [emailpass_1.EmailPassAuthService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.AUTH, {
    services,
});
//# sourceMappingURL=index.js.map