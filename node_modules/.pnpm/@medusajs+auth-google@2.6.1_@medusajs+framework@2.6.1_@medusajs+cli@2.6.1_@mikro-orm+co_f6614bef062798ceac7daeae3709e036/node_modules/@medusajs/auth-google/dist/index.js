"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const google_1 = require("./services/google");
const services = [google_1.GoogleAuthService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.AUTH, {
    services,
});
//# sourceMappingURL=index.js.map