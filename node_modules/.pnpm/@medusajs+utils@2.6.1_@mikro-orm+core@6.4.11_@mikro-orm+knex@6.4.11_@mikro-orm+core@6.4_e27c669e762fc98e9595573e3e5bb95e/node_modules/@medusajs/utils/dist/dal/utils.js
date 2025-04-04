"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionWrapper = transactionWrapper;
exports.normalizeMigrationSQL = normalizeMigrationSQL;
async function transactionWrapper(manager, task, { transaction, isolationLevel, enableNestedTransactions = false, } = {}) {
    // Reuse the same transaction if it is already provided and nested transactions are disabled
    if (!enableNestedTransactions && transaction) {
        return await task(transaction);
    }
    const options = {};
    if (transaction) {
        Object.assign(options, { ctx: transaction });
    }
    if (isolationLevel) {
        Object.assign(options, { isolationLevel });
    }
    const transactionMethod = manager.transaction ?? manager.transactional;
    return await transactionMethod.bind(manager)(task, options);
}
function normalizeMigrationSQL(sql) {
    sql = sql.replace(/create table (?!if not exists)/g, "create table if not exists ");
    sql = sql.replace(/alter table (?!if exists)/g, "alter table if exists ");
    sql = sql.replace(/create index (?!if not exists)/g, "create index if not exists ");
    sql = sql.replace(/alter index (?!if exists)/g, "alter index if exists ");
    sql = sql.replace(/drop index (?!if exists)/g, "drop index if exists ");
    sql = sql.replace(/create unique index (?!if not exists)/g, "create unique index if not exists ");
    sql = sql.replace(/drop unique index (?!if exists)/g, "drop unique index if exists ");
    sql = sql.replace(/add column (?!if not exists)/g, "add column if not exists ");
    sql = sql.replace(/drop column (?!if exists)/g, "drop column if exists ");
    sql = sql.replace(/drop constraint (?!if exists)/g, "drop constraint if exists ");
    return sql;
}
//# sourceMappingURL=utils.js.map