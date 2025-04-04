"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const local_file_1 = require("./services/local-file");
const services = [local_file_1.LocalFileService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.FILE, {
    services,
});
//# sourceMappingURL=index.js.map