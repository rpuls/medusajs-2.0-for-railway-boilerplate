"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.User = utils_1.model
    .define("user", {
    id: utils_1.model.id({ prefix: "user" }).primaryKey(),
    first_name: utils_1.model.text().searchable().nullable(),
    last_name: utils_1.model.text().searchable().nullable(),
    email: utils_1.model.text().searchable(),
    avatar_url: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        unique: true,
        on: ["email"],
        where: "deleted_at IS NULL",
    },
]);
//# sourceMappingURL=user.js.map