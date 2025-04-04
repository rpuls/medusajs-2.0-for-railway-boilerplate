"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnReason = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _ReturnReason = utils_1.model
    .define("ReturnReason", {
    id: utils_1.model.id({ prefix: "rr" }).primaryKey(),
    value: utils_1.model.text().searchable(),
    label: utils_1.model.text().searchable(),
    description: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    parent_return_reason: utils_1.model
        .belongsTo(() => _ReturnReason, {
        mappedBy: "return_reason_children",
    })
        .nullable(),
    return_reason_children: utils_1.model.hasMany(() => _ReturnReason, {
        mappedBy: "parent_return_reason",
    }),
})
    .indexes([
    {
        name: "IDX_return_reason_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_reason_value",
        on: ["value"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_return_reason_parent_return_reason_id",
        on: ["parent_return_reason_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.ReturnReason = _ReturnReason;
//# sourceMappingURL=return-reason.js.map