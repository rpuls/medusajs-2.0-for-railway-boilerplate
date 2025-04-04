"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProduct = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.OrderProduct = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.ORDER,
            entity: "OrderLineItem",
            relationship: {
                serviceName: utils_1.Modules.PRODUCT,
                entity: "Product",
                primaryKey: "id",
                foreignKey: "items.product_id",
                alias: "product",
                args: {
                    methodSuffix: "Products",
                },
            },
        },
        {
            serviceName: utils_1.Modules.ORDER,
            entity: "OrderLineItem",
            relationship: {
                serviceName: utils_1.Modules.PRODUCT,
                entity: "ProductVariant",
                primaryKey: "id",
                foreignKey: "items.variant_id",
                alias: "variant",
                args: {
                    methodSuffix: "ProductVariants",
                },
            },
        },
        {
            serviceName: utils_1.Modules.PRODUCT,
            entity: "ProductVariant",
            relationship: {
                serviceName: utils_1.Modules.ORDER,
                entity: "OrderLineItem",
                primaryKey: "variant_id",
                foreignKey: "id",
                alias: "order_items",
                isList: true,
                args: {
                    methodSuffix: "OrderLineItems",
                },
            },
        },
    ],
};
//# sourceMappingURL=order-product.js.map