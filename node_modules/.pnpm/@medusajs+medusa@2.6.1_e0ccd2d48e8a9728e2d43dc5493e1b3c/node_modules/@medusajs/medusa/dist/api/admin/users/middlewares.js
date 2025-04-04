"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserRoutesMiddlewares = void 0;
const authenticate_middleware_1 = require("../../../utils/middlewares/authenticate-middleware");
const framework_1 = require("@medusajs/framework");
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
// TODO: Due to issues with our routing (and using router.use for applying middlewares), we have to opt-out of global auth in all routes, and then reapply it here.
// See https://medusacorp.slack.com/archives/C025KMS13SA/p1716455350491879 for details.
exports.adminUserRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/users",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("user", ["bearer", "session"]),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUsersParams, QueryConfig.listTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/users/:id",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("user", ["bearer", "session"]),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUserParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/users/me",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("user", ["bearer", "session"]),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUserParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/users/:id",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("user", ["bearer", "session"]),
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateUser),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetUserParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/users/:id",
        middlewares: [(0, authenticate_middleware_1.authenticate)("user", ["bearer", "session"])],
    },
];
//# sourceMappingURL=middlewares.js.map