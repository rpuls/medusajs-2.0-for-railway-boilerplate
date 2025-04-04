"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartSalesChannel = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.CartSalesChannel = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.CART,
            entity: "Cart",
            relationship: {
                serviceName: utils_1.Modules.SALES_CHANNEL,
                entity: "SalesChannel",
                primaryKey: "id",
                foreignKey: "sales_channel_id",
                alias: "sales_channel",
                args: {
                    methodSuffix: "SalesChannels",
                },
            },
        },
        {
            serviceName: utils_1.Modules.SALES_CHANNEL,
            entity: "SalesChannel",
            relationship: {
                serviceName: utils_1.Modules.CART,
                entity: "Cart",
                primaryKey: "sales_channel_id",
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
//# sourceMappingURL=cart-sales-channel.js.map