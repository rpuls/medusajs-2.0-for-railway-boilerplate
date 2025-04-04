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
exports.adminSalesChannelRoutesMiddlewares = void 0;
const http_1 = require("@medusajs/framework/http");
const framework_1 = require("@medusajs/framework");
const validators_1 = require("../../utils/validators");
const QueryConfig = __importStar(require("./query-config"));
const validators_2 = require("./validators");
exports.adminSalesChannelRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/sales-channels",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetSalesChannelsParams, QueryConfig.listTransformQueryConfig),
            (0, http_1.maybeApplyLinkFilter)({
                entryPoint: "sales_channel_location",
                resourceId: "sales_channel_id",
                filterableField: "location_id",
            }),
            (0, http_1.maybeApplyLinkFilter)({
                entryPoint: "publishable_api_key_sales_channel",
                resourceId: "sales_channel_id",
                filterableField: "publishable_key_id",
            }),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/sales-channels/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetSalesChannelParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/sales-channels",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminCreateSalesChannel),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetSalesChannelParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/sales-channels/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminUpdateSalesChannel),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetSalesChannelParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/sales-channels/:id",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/sales-channels/:id/products",
        middlewares: [
            (0, framework_1.validateAndTransformBody)((0, validators_1.createLinkBody)()),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetSalesChannelParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map