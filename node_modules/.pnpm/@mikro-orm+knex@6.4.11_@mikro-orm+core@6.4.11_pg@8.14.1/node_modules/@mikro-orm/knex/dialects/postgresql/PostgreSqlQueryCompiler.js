"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSqlQueryCompiler = void 0;
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class PostgreSqlQueryCompiler extends MonkeyPatchable_1.MonkeyPatchable.PostgresQueryCompiler {
    _lockingClause(lockMode) {
        const tables = this.single.lockTables || [];
        return lockMode + (tables.length
            ? ' of ' + tables.filter(Boolean).map((table) => this.formatter.wrap(table)).join(', ')
            : '');
    }
}
exports.PostgreSqlQueryCompiler = PostgreSqlQueryCompiler;
