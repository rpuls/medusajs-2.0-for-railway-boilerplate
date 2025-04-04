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
exports.adminTaxRateRoutesMiddlewares = void 0;
const QueryConfig = __importStar(require("./query-config"));
const framework_1 = require("@medusajs/framework");
const validators_1 = require("./validators");
exports.adminTaxRateRoutesMiddlewares = [
    {
        method: "POST",
        matcher: "/admin/tax-rates",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateTaxRate),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRateParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: "POST",
        matcher: "/admin/tax-rates/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateTaxRate),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRateParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: "GET",
        matcher: "/admin/tax-rates/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRateParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: "GET",
        matcher: "/admin/tax-rates",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRatesParams, QueryConfig.listTransformQueryConfig),
        ],
    },
    {
        method: "POST",
        matcher: "/admin/tax-rates/:id/rules",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateTaxRateRule),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRateParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: "DELETE",
        matcher: "/admin/tax-rates/:id/rules/:rule_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetTaxRateParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map