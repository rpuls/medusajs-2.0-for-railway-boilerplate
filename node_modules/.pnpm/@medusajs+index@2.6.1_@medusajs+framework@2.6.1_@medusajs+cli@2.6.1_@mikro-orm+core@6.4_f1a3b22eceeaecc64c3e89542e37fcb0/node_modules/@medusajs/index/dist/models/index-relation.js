"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const IndexRelation = utils_1.model.define("IndexRelation", {
    id: utils_1.model.autoincrement().primaryKey(),
    pivot: utils_1.model.text(),
    parent_name: utils_1.model.text(),
    parent_id: utils_1.model.text(),
    child_name: utils_1.model.text(),
    child_id: utils_1.model.text(),
    staled_at: utils_1.model.dateTime().nullable(),
});
exports.default = IndexRelation;
//# sourceMappingURL=index-relation.js.map