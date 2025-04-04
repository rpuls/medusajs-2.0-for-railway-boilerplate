"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteTableCompiler = void 0;
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class SqliteTableCompiler extends MonkeyPatchable_1.MonkeyPatchable.Sqlite3DialectTableCompiler {
    foreign(foreignInfo) {
        foreignInfo.column = Array.isArray(foreignInfo.column)
            ? foreignInfo.column
            : [foreignInfo.column];
        foreignInfo.column = foreignInfo.column.map((column) => this.client.customWrapIdentifier(column, (a) => a));
        foreignInfo.inTable = this.client.customWrapIdentifier(foreignInfo.inTable, (a) => a);
        foreignInfo.references = Array.isArray(foreignInfo.references)
            ? foreignInfo.references
            : [foreignInfo.references];
        foreignInfo.references = foreignInfo.references.map((column) => this.client.customWrapIdentifier(column, (a) => a));
        // quoted versions
        const column = this.formatter.columnize(foreignInfo.column);
        const inTable = this.formatter.columnize(foreignInfo.inTable);
        const references = this.formatter.columnize(foreignInfo.references);
        const keyName = this.formatter.columnize(foreignInfo.keyName);
        const addColumnQuery = this.sequence.find((query) => query.sql.includes(`add column ${column[0]}`));
        // no need for temp tables if we just add a column
        if (addColumnQuery) {
            /* istanbul ignore next */
            const onUpdate = foreignInfo.onUpdate ? ` on update ${foreignInfo.onUpdate}` : '';
            /* istanbul ignore next */
            const onDelete = foreignInfo.onDelete ? ` on delete ${foreignInfo.onDelete}` : '';
            addColumnQuery.sql += ` constraint ${keyName} references ${inTable} (${references})${onUpdate}${onDelete}`;
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const compiler = this;
        if (this.method !== 'create' && this.method !== 'createIfNot') {
            this.pushQuery({
                sql: `PRAGMA table_info(${this.tableName()})`,
                statementsProducer(pragma, connection) {
                    return compiler.client
                        .ddl(compiler, pragma, connection)
                        .foreign(foreignInfo);
                },
            });
        }
    }
    foreignKeys() {
        let sql = '';
        const foreignKeys = (this.grouped.alterTable || []).filter((o) => o.method === 'foreign');
        for (let i = 0, l = foreignKeys.length; i < l; i++) {
            const foreign = foreignKeys[i].args[0];
            const column = this.formatter.columnize(foreign.column);
            const references = this.formatter.columnize(foreign.references);
            const foreignTable = this.formatter.wrap(foreign.inTable);
            /* istanbul ignore next */
            let constraintName = foreign.keyName || '';
            if (constraintName) {
                constraintName = ' constraint ' + this.formatter.wrap(constraintName);
            }
            sql += `,${constraintName} foreign key(${column}) references ${foreignTable}(${references})`;
            if (foreign.onDelete) {
                sql += ` on delete ${foreign.onDelete}`;
            }
            if (foreign.onUpdate) {
                sql += ` on update ${foreign.onUpdate}`;
            }
            if (foreign.deferrable) {
                sql += ` deferrable initially ${foreign.deferrable}`;
            }
        }
        return sql;
    }
}
exports.SqliteTableCompiler = SqliteTableCompiler;
