"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const s3_file_1 = require("./services/s3-file");
const services = [s3_file_1.S3FileService];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.FILE, {
    services,
});
//# sourceMappingURL=index.js.map