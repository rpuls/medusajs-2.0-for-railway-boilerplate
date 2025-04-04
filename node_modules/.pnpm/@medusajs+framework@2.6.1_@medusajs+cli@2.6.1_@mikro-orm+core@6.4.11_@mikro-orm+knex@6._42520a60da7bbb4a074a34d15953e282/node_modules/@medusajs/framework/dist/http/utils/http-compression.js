"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldCompressResponse = shouldCompressResponse;
exports.compressionOptions = compressionOptions;
const compression_1 = __importDefault(require("compression"));
const utils_1 = require("@medusajs/utils");
function shouldCompressResponse(req, res) {
    const { projectConfig } = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const { enabled } = compressionOptions(projectConfig);
    if (!enabled) {
        return false;
    }
    if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false;
    }
    // fallback to standard filter function
    return compression_1.default.filter(req, res);
}
function compressionOptions(config) {
    const responseCompressionOptions = config.http.compression ?? {};
    responseCompressionOptions.enabled =
        responseCompressionOptions.enabled ?? false;
    responseCompressionOptions.level = responseCompressionOptions.level ?? 6;
    responseCompressionOptions.memLevel = responseCompressionOptions.memLevel ?? 8;
    responseCompressionOptions.threshold =
        responseCompressionOptions.threshold ?? 1024;
    return responseCompressionOptions;
}
//# sourceMappingURL=http-compression.js.map