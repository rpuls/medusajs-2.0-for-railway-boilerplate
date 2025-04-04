"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminShippingProfilesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const query_config_1 = require("./query-config");
const validators_1 = require("./validators");
exports.adminShippingProfilesMiddlewares = [
    {
        method: ["POST"],
        matcher: "/admin/shipping-profiles",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateShippingProfile),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetShippingProfilesParams, query_config_1.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/shipping-profiles",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetShippingProfilesParams, query_config_1.listTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/shipping-profiles/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateShippingProfile),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetShippingProfileParams, query_config_1.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/shipping-profiles/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetShippingProfileParams, query_config_1.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map