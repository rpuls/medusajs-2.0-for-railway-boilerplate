"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const address_1 = __importDefault(require("./address"));
const customer_group_1 = __importDefault(require("./customer-group"));
const customer_group_customer_1 = __importDefault(require("./customer-group-customer"));
const Customer = utils_1.model
    .define("Customer", {
    id: utils_1.model.id({ prefix: "cus" }).primaryKey(),
    company_name: utils_1.model.text().searchable().nullable(),
    first_name: utils_1.model.text().searchable().nullable(),
    last_name: utils_1.model.text().searchable().nullable(),
    email: utils_1.model.text().searchable().nullable(),
    phone: utils_1.model.text().searchable().nullable(),
    has_account: utils_1.model.boolean().default(false),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
    groups: utils_1.model.manyToMany(() => customer_group_1.default, {
        mappedBy: "customers",
        pivotEntity: () => customer_group_customer_1.default,
    }),
    addresses: utils_1.model.hasMany(() => address_1.default, {
        mappedBy: "customer",
    }),
})
    .cascades({
    delete: ["addresses"],
    detach: ["groups"],
})
    .indexes([
    {
        on: ["email", "has_account"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = Customer;
//# sourceMappingURL=customer.js.map