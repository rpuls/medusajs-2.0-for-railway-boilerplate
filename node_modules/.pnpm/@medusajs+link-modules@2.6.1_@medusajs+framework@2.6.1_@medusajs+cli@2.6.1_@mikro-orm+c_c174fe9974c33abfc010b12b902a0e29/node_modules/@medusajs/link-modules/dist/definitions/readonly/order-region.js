"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRegion = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.OrderRegion = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.ORDER,
            entity: "Order",
            relationship: {
                serviceName: utils_1.Modules.REGION,
                entity: "Region",
                primaryKey: "id",
                foreignKey: "region_id",
                alias: "region",
                args: {
                    methodSuffix: "Regions",
                },
            },
        },
        {
            serviceName: utils_1.Modules.REGION,
            entity: "Region",
            relationship: {
                serviceName: utils_1.Modules.ORDER,
                entity: "Order",
                primaryKey: "region_id",
                foreignKey: "id",
                alias: "orders",
                args: {
                    methodSuffix: "Orders",
                },
                isList: true,
            },
        },
    ],
};
//# sourceMappingURL=order-region.js.map