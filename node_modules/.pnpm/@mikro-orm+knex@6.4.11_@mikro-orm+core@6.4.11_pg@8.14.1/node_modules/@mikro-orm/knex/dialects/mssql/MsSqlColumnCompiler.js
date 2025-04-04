"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsSqlColumnCompiler = void 0;
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class MsSqlColumnCompiler extends MonkeyPatchable_1.MonkeyPatchable.MsSqlColumnCompiler {
    enu(allowed) {
        return `nvarchar(100) check (${this.formatter.wrap(this.args[0])} in ('${(allowed.join("', '"))}'))`;
    }
}
exports.MsSqlColumnCompiler = MsSqlColumnCompiler;
