"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const github_1 = require("./services/github");
const services = [github_1.GithubAuthService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.AUTH, {
    services,
});
//# sourceMappingURL=index.js.map