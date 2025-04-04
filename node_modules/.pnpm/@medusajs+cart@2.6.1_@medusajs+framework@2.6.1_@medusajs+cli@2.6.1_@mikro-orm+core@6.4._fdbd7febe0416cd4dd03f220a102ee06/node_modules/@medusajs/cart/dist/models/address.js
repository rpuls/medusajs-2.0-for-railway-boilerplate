"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const Address = utils_1.model.define({ tableName: "cart_address", name: "Address" }, {
    id: utils_1.model.id({ prefix: "caaddr" }).primaryKey(),
    customer_id: utils_1.model.text().nullable(),
    company: utils_1.model.text().nullable(),
    first_name: utils_1.model.text().nullable(),
    last_name: utils_1.model.text().nullable(),
    address_1: utils_1.model.text().nullable(),
    address_2: utils_1.model.text().nullable(),
    city: utils_1.model.text().nullable(),
    country_code: utils_1.model.text().nullable(),
    province: utils_1.model.text().nullable(),
    postal_code: utils_1.model.text().nullable(),
    phone: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
});
exports.default = Address;
//# sourceMappingURL=address.js.map