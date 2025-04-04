"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUploadRoutesMiddlewares = void 0;
const multer_1 = __importDefault(require("multer"));
const framework_1 = require("@medusajs/framework");
const query_config_1 = require("./query-config");
const validators_1 = require("./validators");
// TODO: For now we keep the files in memory, as that's how they get passed to the workflows
// This will need revisiting once we are closer to prod-ready v2, since with workflows and potentially
// services on other machines using streams is not as simple as it used to be.
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.adminUploadRoutesMiddlewares = [
    // TODO: There is a `/protected` route in v1 that might need a bit more thought when implementing
    {
        method: ["POST"],
        matcher: "/admin/uploads",
        middlewares: [
            upload.array("files"),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUploadParams, query_config_1.retrieveUploadConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/uploads/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUploadParams, query_config_1.retrieveUploadConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/uploads/:id",
        middlewares: [],
    },
];
//# sourceMappingURL=middlewares.js.map