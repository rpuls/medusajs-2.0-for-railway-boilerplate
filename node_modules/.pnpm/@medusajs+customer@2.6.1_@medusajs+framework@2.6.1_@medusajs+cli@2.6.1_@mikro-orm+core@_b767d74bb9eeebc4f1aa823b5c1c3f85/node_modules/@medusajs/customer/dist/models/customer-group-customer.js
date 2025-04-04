"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const customer_1 = __importDefault(require("./customer"));
const customer_group_1 = __importDefault(require("./customer-group"));
const CustomerGroupCustomer = utils_1.model.define("CustomerGroupCustomer", {
    id: utils_1.model.id({ prefix: "cusgc" }).primaryKey(),
    created_by: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    customer: utils_1.model.belongsTo(() => customer_1.default, {
        mappedBy: "groups",
    }),
    customer_group: utils_1.model.belongsTo(() => customer_group_1.default, {
        mappedBy: "customers",
    }),
});
exports.default = CustomerGroupCustomer;
//# sourceMappingURL=customer-group-customer.js.map