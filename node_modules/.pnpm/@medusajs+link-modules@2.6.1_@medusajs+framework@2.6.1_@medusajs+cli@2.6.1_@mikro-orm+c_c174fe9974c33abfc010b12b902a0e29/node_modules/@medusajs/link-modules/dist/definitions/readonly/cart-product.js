"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartProduct = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.CartProduct = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.CART,
            entity: "LineItem",
            relationship: {
                serviceName: utils_1.Modules.PRODUCT,
                primaryKey: "id",
                foreignKey: "items.product_id",
                alias: "product",
                args: {
                    methodSuffix: "Products",
                },
            },
        },
        {
            serviceName: utils_1.Modules.CART,
            entity: "LineItem",
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
            relationship: {
                serviceName: utils_1.Modules.CART,
                entity: "LineItem",
                primaryKey: "variant_id",
                foreignKey: "id",
                alias: "cart_items",
                isList: true,
                args: {
                    methodSuffix: "LineItems",
                },
            },
        },
    ],
};
//# sourceMappingURL=cart-product.js.map