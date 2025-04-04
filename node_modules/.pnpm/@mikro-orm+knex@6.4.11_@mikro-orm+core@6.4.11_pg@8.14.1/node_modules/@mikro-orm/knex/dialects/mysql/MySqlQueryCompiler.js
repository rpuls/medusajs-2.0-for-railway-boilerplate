"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlQueryCompiler = void 0;
/* istanbul ignore file */
// @ts-ignore
const mysql_querycompiler_1 = __importDefault(require("knex/lib/dialects/mysql/query/mysql-querycompiler"));
// @ts-ignore
const querycompiler_1 = __importDefault(require("knex/lib/query/querycompiler"));
// upsert support from https://github.com/knex/knex/pull/6050
class MySqlQueryCompiler extends mysql_querycompiler_1.default {
    // mysql dialect disallows query non scalar params, but we dont use it to execute the query, it always goes through the `platform.formatQuery()`
    whereBasic(statement) {
        return querycompiler_1.default.prototype.whereBasic.call(this, statement);
    }
    // mysql dialect disallows query non scalar params, but we dont use it to execute the query, it always goes through the `platform.formatQuery()`
    whereRaw(statement) {
        return querycompiler_1.default.prototype.whereRaw.call(this, statement);
    }
}
exports.MySqlQueryCompiler = MySqlQueryCompiler;
