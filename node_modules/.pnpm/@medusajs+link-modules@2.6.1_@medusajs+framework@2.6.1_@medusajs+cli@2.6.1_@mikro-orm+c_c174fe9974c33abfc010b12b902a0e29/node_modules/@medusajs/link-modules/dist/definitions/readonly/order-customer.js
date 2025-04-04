"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCustomer = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.OrderCustomer = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.ORDER,
            entity: "Order",
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
                serviceName: utils_1.Modules.ORDER,
                entity: "Order",
                primaryKey: "customer_id",
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
//# sourceMappingURL=order-customer.js.map