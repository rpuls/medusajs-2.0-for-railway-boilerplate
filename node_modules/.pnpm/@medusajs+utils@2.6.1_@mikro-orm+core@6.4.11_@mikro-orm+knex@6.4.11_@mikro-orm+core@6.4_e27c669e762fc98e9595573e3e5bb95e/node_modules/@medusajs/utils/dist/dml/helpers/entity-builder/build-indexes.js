"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformIndexWhere = transformIndexWhere;
const common_1 = require("../../../common");
const query_builder_1 = require("./query-builder");
/*
  The DML provides an opinionated soft deletable entity as a part of every model
  We assume that deleted_at would be scoped in indexes in all cases as an index without the scope
  doesn't seem to be valid. If a case presents itself where one would like to remove the scope,
  this will need to be updated to include that case.
*/
function transformIndexWhere(index) {
    return (0, common_1.isObject)(index.where)
        ? transformWhereQb(index.where)
        : transformWhere(index.where);
}
function transformWhereQb(where) {
    if (!(0, common_1.isPresent)(where.deleted_at)) {
        where.deleted_at = null;
    }
    return (0, query_builder_1.buildWhereQuery)(where);
}
function transformWhere(where) {
    const lowerCaseWhere = where?.toLowerCase();
    const whereIncludesDeleteable = lowerCaseWhere?.includes("deleted_at is null") ||
        lowerCaseWhere?.includes("deleted_at is not null");
    // If where scope does not include a deleted_at scope, we add a soft deletable scope to it
    if (where && !whereIncludesDeleteable) {
        where = where + ` AND deleted_at IS NULL`;
    }
    // If where scope isn't present, we will set an opinionated where scope to the index
    if (!where?.length) {
        where = "deleted_at IS NULL";
    }
    return where;
}
//# sourceMappingURL=build-indexes.js.map