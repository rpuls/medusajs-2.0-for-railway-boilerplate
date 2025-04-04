"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const IndexSync = utils_1.model
    .define("IndexSync", {
    id: utils_1.model.id({ prefix: "idxsync" }).primaryKey(),
    entity: utils_1.model.text(),
    last_key: utils_1.model.text().nullable(),
})
    .indexes([
    {
        name: "IDX_index_sync_entity",
        on: ["entity"],
        unique: true,
    },
]);
exports.default = IndexSync;
//# sourceMappingURL=index-sync.js.map