"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlKnexDialect = void 0;
const MySqlQueryCompiler_1 = require("./MySqlQueryCompiler");
const MySqlColumnCompiler_1 = require("./MySqlColumnCompiler");
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class MySqlKnexDialect extends MonkeyPatchable_1.MonkeyPatchable.MySqlDialect {
    queryCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new MySqlQueryCompiler_1.MySqlQueryCompiler(this, ...arguments);
    }
    columnCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new MySqlColumnCompiler_1.MySqlColumnCompiler(this, ...arguments);
    }
}
exports.MySqlKnexDialect = MySqlKnexDialect;
