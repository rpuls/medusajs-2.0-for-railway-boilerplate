"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const IndexData = utils_1.model.define("IndexData", {
    id: utils_1.model.text().primaryKey(),
    name: utils_1.model.text().primaryKey(),
    data: utils_1.model.json().default({}),
    staled_at: utils_1.model.dateTime().nullable(),
    // document_tsv: model.tsvector(), NOTE: This is not supported and it is here for reference of its counter part in the migration
});
exports.default = IndexData;
//# sourceMappingURL=index-data.js.map