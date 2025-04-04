"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSqlKnexDialect = void 0;
const PostgreSqlTableCompiler_1 = require("./PostgreSqlTableCompiler");
const PostgreSqlQueryCompiler_1 = require("./PostgreSqlQueryCompiler");
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class PostgreSqlKnexDialect extends MonkeyPatchable_1.MonkeyPatchable.PostgresDialect {
    ormConfig;
    tableCompiler() {
        // eslint-disable-next-line prefer-rest-params
        const tableCompiler = new PostgreSqlTableCompiler_1.PostgreSqlTableCompiler(this, ...arguments);
        tableCompiler.ormConfig = this.ormConfig;
        return tableCompiler;
    }
    queryCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new PostgreSqlQueryCompiler_1.PostgreSqlQueryCompiler(this, ...arguments);
    }
}
exports.PostgreSqlKnexDialect = PostgreSqlKnexDialect;
