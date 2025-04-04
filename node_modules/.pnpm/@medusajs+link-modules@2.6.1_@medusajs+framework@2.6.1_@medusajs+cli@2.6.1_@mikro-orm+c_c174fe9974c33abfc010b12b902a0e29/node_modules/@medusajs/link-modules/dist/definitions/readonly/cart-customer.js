"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartCustomer = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.CartCustomer = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.CART,
            entity: "Cart",
            relationship: {
                serviceName: utils_1.Modules.CUSTOMER,
                entity: "Customer",
                primaryKey: "id",
                foreignKey: "customer_id",
                alias: "customer",
                args: {
                    methodSuffix: "Customers",
                },
            },
        },
        {
            serviceName: utils_1.Modules.CUSTOMER,
            entity: "Customer",
            relationship: {
                serviceName: utils_1.Modules.CART,
                entity: "Cart",
                primaryKey: "customer_id",
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
//# sourceMappingURL=cart-customer.js.map