"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const customer_1 = __importDefault(require("./customer"));
const _models_1 = require(".");
const CustomerGroup = utils_1.model
    .define("CustomerGroup", {
    id: utils_1.model.id({ prefix: "cusgroup" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
    customers: utils_1.model.manyToMany(() => customer_1.default, {
        mappedBy: "groups",
        pivotEntity: () => _models_1.CustomerGroupCustomer,
    }),
})
    .indexes([
    {
        on: ["name"],
        unique: true,
        where: "deleted_at IS NULL",
    },
])
    .cascades({
    detach: ["customers"],
});
exports.default = CustomerGroup;
//# sourceMappingURL=customer-group.js.map