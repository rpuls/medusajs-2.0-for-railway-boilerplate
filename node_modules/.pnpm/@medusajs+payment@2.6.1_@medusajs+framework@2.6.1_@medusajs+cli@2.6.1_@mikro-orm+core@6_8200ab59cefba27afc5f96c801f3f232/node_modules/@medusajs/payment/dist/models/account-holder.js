"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const AccountHolder = utils_1.model
    .define("AccountHolder", {
    id: utils_1.model.id({ prefix: "acchld" }).primaryKey(),
    provider_id: utils_1.model.text(),
    external_id: utils_1.model.text(),
    email: utils_1.model.text().nullable(),
    data: utils_1.model.json().default({}),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["provider_id", "external_id"],
        unique: true,
    },
]);
exports.default = AccountHolder;
//# sourceMappingURL=account-holder.js.map