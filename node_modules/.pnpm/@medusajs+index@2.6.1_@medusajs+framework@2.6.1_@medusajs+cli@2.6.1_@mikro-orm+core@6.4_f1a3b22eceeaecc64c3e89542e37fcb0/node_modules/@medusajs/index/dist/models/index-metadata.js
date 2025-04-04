"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const index_metadata_status_1 = require("../utils/index-metadata-status");
const IndexMetadata = utils_1.model
    .define("IndexMetadata", {
    id: utils_1.model.id({ prefix: "idxmeta" }).primaryKey(),
    entity: utils_1.model.text(),
    fields: utils_1.model.text(),
    fields_hash: utils_1.model.text(),
    status: utils_1.model
        .enum(index_metadata_status_1.IndexMetadataStatus)
        .default(index_metadata_status_1.IndexMetadataStatus.PENDING),
})
    .indexes([
    {
        name: "IDX_index_metadata_entity",
        on: ["entity"],
        unique: true,
    },
]);
exports.default = IndexMetadata;
//# sourceMappingURL=index-metadata.js.map