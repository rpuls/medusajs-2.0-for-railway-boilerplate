"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAddress = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _OrderAddress = utils_1.model
    .define("OrderAddress", {
    id: utils_1.model.id({ prefix: "ordaddr" }).primaryKey(),
    customer_id: utils_1.model.text().nullable(),
    company: utils_1.model.text().searchable().nullable(),
    first_name: utils_1.model.text().searchable().nullable(),
    last_name: utils_1.model.text().searchable().nullable(),
    address_1: utils_1.model.text().searchable().nullable(),
    address_2: utils_1.model.text().searchable().nullable(),
    city: utils_1.model.text().searchable().nullable(),
    country_code: utils_1.model.text().nullable(),
    province: utils_1.model.text().searchable().nullable(),
    postal_code: utils_1.model.text().searchable().nullable(),
    phone: utils_1.model.text().searchable().nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        name: "IDX_order_address_customer_id",
        on: ["customer_id"],
        unique: false,
    },
]);
exports.OrderAddress = _OrderAddress;
//# sourceMappingURL=address.js.map