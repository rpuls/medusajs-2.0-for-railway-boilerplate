"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRegion = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.CartRegion = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.CART,
            entity: "Cart",
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
                serviceName: utils_1.Modules.CART,
                entity: "Cart",
                primaryKey: "region_id",
                foreignKey: "id",
                alias: "carts",
                args: {
                    methodSuffix: "Carts",
                },
                isList: true,
            },
        },
    ],
};
//# sourceMappingURL=cart-region.js.map