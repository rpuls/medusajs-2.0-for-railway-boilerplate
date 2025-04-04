"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsSqlKnexDialect = void 0;
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
const MsSqlTableCompiler_1 = require("./MsSqlTableCompiler");
const MsSqlColumnCompiler_1 = require("./MsSqlColumnCompiler");
const MsSqlQueryCompiler_1 = require("./MsSqlQueryCompiler");
class MsSqlKnexDialect extends MonkeyPatchable_1.MonkeyPatchable.MsSqlDialect {
    tableCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new MsSqlTableCompiler_1.MsSqlTableCompiler(this, ...arguments);
    }
    columnCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new MsSqlColumnCompiler_1.MsSqlColumnCompiler(this, ...arguments);
    }
    queryCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new MsSqlQueryCompiler_1.MsSqlQueryCompiler(this, ...arguments);
    }
}
exports.MsSqlKnexDialect = MsSqlKnexDialect;
