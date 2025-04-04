"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlColumnCompiler = void 0;
// @ts-ignore
const mysql_columncompiler_1 = __importDefault(require("knex/lib/dialects/mysql/schema/mysql-columncompiler"));
class MySqlColumnCompiler extends mysql_columncompiler_1.default {
    // we need the old behaviour to be able to add auto_increment to a column that is already PK
    increments(options) {
        return this.generateDDL(options);
    }
    /* istanbul ignore next */
    bigincrements(options) {
        return this.generateDDL(options);
    }
    generateDDL(options = {}) {
        const { primaryKey = true, unsigned = true, type = 'int' } = options;
        return type
            + (unsigned ? ' unsigned' : '')
            + ' not null auto_increment'
            + (this.tableCompiler._canBeAddPrimaryKey({ primaryKey }) ? ' primary key' : '');
    }
}
exports.MySqlColumnCompiler = MySqlColumnCompiler;
