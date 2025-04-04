"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyIndexes = applyIndexes;
exports.applyEntityIndexes = applyEntityIndexes;
const common_1 = require("../../../common");
const build_indexes_1 = require("../mikro-orm/build-indexes");
/**
 * Creates indexes for a given field
 */
function applyIndexes(MikroORMEntity, tableName, field) {
    field.indexes.forEach((index) => {
        const providerEntityIdIndexStatement = (0, common_1.createPsqlIndexStatementHelper)({
            name: index.name,
            tableName,
            columns: [field.fieldName],
            unique: index.type === "unique",
            where: "deleted_at IS NULL",
        });
        providerEntityIdIndexStatement.MikroORMIndex()(MikroORMEntity);
    });
}
/**
 * Creates indexes for a MikroORM entity
 *
 * Default Indexes:
 *  - Foreign key indexes will be applied to all manyToOne relationships.
 */
function applyEntityIndexes(MikroORMEntity, tableName, entityIndexes = []) {
    const indexes = [...entityIndexes];
    indexes.forEach((index) => {
        (0, build_indexes_1.validateIndexFields)(MikroORMEntity, index);
        const entityIndexStatement = (0, common_1.createPsqlIndexStatementHelper)({
            tableName,
            name: index.name,
            columns: index.on,
            unique: index.unique,
            where: index.where,
            type: index.type,
        });
        entityIndexStatement.MikroORMIndex()(MikroORMEntity);
    });
}
//# sourceMappingURL=apply-indexes.js.map