"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentAddress = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.FulfillmentAddress = utils_1.model.define("fulfillment_address", {
    id: utils_1.model.id({ prefix: "fuladdr" }).primaryKey(),
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
//# sourceMappingURL=address.js.map