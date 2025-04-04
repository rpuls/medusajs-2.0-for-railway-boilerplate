"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const SalesChannel = utils_1.model.define("SalesChannel", {
    id: utils_1.model.id({ prefix: "sc" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    description: utils_1.model.text().searchable().nullable(),
    is_disabled: utils_1.model.boolean().default(false),
    metadata: utils_1.model.json().nullable(),
});
exports.default = SalesChannel;
//# sourceMappingURL=sales-channel.js.map