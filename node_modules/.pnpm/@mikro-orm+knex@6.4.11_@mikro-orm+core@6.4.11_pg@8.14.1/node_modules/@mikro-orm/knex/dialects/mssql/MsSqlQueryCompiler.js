"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsSqlQueryCompiler = void 0;
/* istanbul ignore file */
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
const core_1 = require("@mikro-orm/core");
// upsert support from https://github.com/knex/knex/pull/6050
class MsSqlQueryCompiler extends MonkeyPatchable_1.MonkeyPatchable.MsSqlQueryCompiler {
    constructor(client, builder, formatter) {
        const onConflict = builder._single.onConflict;
        delete builder._single.onConflict;
        super(client, builder, formatter);
        this.single.onConflict = onConflict;
    }
    // Compiles an "insert" query, allowing for multiple
    // inserts using a single query statement.
    insert() {
        if (this.single.onConflict) {
            return this._insertWithMerge();
        }
        return super.insert();
    }
    _mergeAnd() {
        const wheres = this.where();
        if (!wheres) {
            return '';
        }
        return `and ${wheres.slice(6)} `;
    }
    _mergeWhenMatched(columns, updates) {
        let columnsData = [];
        if (!updates || Array.isArray(updates)) {
            columnsData = (updates || columns)
                .map((column) => `${this.formatter.columnize(column)}=tsource.${this.formatter.columnize(column)}`)
                .join(', ');
        }
        if (typeof updates === 'string') {
            columnsData = `${this.formatter.columnize(updates)}=tsource.${this.formatter.columnize(updates)}`;
        }
        if (!Array.isArray(updates) && typeof updates === 'object') {
            columnsData = Object.entries(updates)
                .map(([key, value]) => `${this.tableName}.${this.formatter.columnize(key)}=(${this._getParameters([value])})`);
        }
        const sql = ` when matched ${this._mergeAnd()}then update set ${columnsData}`;
        return sql;
    }
    _mergeWhenNotMatched(columns) {
        const destinationColumns = this.formatter.columnize(columns);
        const sourceColumns = this.formatter.columnizeWithPrefix('tsource.', columns);
        const sql = ` when not matched then insert (${destinationColumns}) values (${sourceColumns})`;
        return sql;
    }
    _getParameters(params) {
        const sql = this.client.parameterize(params, this.client.valueForUndefined, this.builder, this.bindingsHolder);
        return sql;
    }
    _mergeInsertIsEmpty(insert) {
        return (Array.isArray(insert) && insert.length === 0)
            || (typeof insert === 'object' && core_1.Utils.isEmpty(insert));
    }
    _mergeOn(conflict) {
        if (!Array.isArray(conflict)) {
            return 'on 1=1';
        }
        const parts = [];
        for (const col of conflict) {
            const conflictColumn = this.formatter.columnize(col);
            parts.push(`${this.tableName}.${conflictColumn} = tsource.${conflictColumn}`);
        }
        return `on ${parts.join(' and ')}`;
    }
    _insertWithMerge() {
        const { insert = [], onConflict, ignore, merge, returning, options = {} } = this.single;
        if (this._mergeInsertIsEmpty(insert)) {
            return '';
        }
        const insertData = this._prepInsert(insert);
        const insertParameters = insertData.values.map((value) => `(${this._getParameters(value)})`).join(', ');
        const sourceColumns = this.formatter.columnize(insertData.columns);
        const returningSql = returning
            ? ` ${this._returning('insert', returning, options.includeTriggerModifications)}`
            : '';
        let sql = `merge into ${this.tableName} using (values ${insertParameters}) as tsource(${sourceColumns}) `;
        sql += this._mergeOn(onConflict);
        sql += this._mergeWhenNotMatched(insertData.columns);
        if (!ignore) {
            sql += this._mergeWhenMatched(insertData.columns, merge.updates);
        }
        sql += returningSql;
        if (options.includeTriggerModifications) {
            sql = this._buildTempTable(returning) + sql + this._buildReturningSelect(returning);
        }
        sql = this.with() + sql + ';';
        return sql;
    }
}
exports.MsSqlQueryCompiler = MsSqlQueryCompiler;
