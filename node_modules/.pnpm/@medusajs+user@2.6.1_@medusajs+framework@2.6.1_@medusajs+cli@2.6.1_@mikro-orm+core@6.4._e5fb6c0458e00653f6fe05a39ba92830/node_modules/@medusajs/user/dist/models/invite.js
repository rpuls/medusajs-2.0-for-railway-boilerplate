"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.Invite = utils_1.model
    .define("invite", {
    id: utils_1.model.id({ prefix: "invite" }).primaryKey(),
    email: utils_1.model.text().searchable(),
    accepted: utils_1.model.boolean().default(false),
    token: utils_1.model.text(),
    expires_at: utils_1.model.dateTime(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["email"],
        unique: true,
        where: "deleted_at IS NULL",
    },
    {
        on: ["token"],
        where: "deleted_at IS NULL",
    },
]);
//# sourceMappingURL=invite.js.map