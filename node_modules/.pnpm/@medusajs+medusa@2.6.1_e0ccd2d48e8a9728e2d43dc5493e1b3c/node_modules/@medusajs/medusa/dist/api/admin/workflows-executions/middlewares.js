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
exports.adminWorkflowsExecutionsMiddlewares = void 0;
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
const framework_1 = require("@medusajs/framework");
const framework_2 = require("@medusajs/framework");
exports.adminWorkflowsExecutionsMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/workflows-executions",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetWorkflowExecutionsParams, QueryConfig.listTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/workflows-executions/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetWorkflowExecutionDetailsParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/workflows-executions/:workflow_id/:transaction_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetWorkflowExecutionDetailsParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/workflows-executions/:workflow_id/run",
        middlewares: [(0, framework_2.validateAndTransformBody)(validators_1.AdminCreateWorkflowsRun)],
    },
    {
        method: ["POST"],
        matcher: "/admin/workflows-executions/:workflow_id/steps/success",
        middlewares: [(0, framework_2.validateAndTransformBody)(validators_1.AdminCreateWorkflowsAsyncResponse)],
    },
    {
        method: ["POST"],
        matcher: "/admin/workflows-executions/:workflow_id/steps/failure",
        middlewares: [(0, framework_2.validateAndTransformBody)(validators_1.AdminCreateWorkflowsAsyncResponse)],
    },
];
//# sourceMappingURL=middlewares.js.map