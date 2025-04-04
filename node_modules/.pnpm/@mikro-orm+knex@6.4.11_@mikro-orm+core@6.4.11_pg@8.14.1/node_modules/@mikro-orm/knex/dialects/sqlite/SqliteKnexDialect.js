"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteKnexDialect = void 0;
const SqliteTableCompiler_1 = require("./SqliteTableCompiler");
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class SqliteKnexDialect extends MonkeyPatchable_1.MonkeyPatchable.Sqlite3Dialect {
    tableCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new SqliteTableCompiler_1.SqliteTableCompiler(this, ...arguments);
    }
    processResponse(obj, runner) {
        if (obj.method === 'raw' && this.isRunQuery(obj.sql)) {
            return obj.response ?? obj.context;
        }
        return super.processResponse(obj, runner);
    }
    _query(connection, obj) {
        const callMethod = this.getCallMethod(obj);
        return new Promise((resolve, reject) => {
            /* istanbul ignore if */
            if (!connection?.[callMethod]) {
                return reject(new Error(`Error calling ${callMethod} on connection.`));
            }
            connection[callMethod](obj.sql, obj.bindings, function (err, response) {
                if (err) {
                    return reject(err);
                }
                obj.response = response;
                obj.context = this;
                return resolve(obj);
            });
        });
    }
    getCallMethod(obj) {
        if (obj.method === 'raw') {
            const query = obj.sql.trim().toLowerCase();
            if ((query.startsWith('insert into') || query.startsWith('update ')) && query.includes(' returning ')) {
                return 'all';
            }
            if (this.isRunQuery(query)) {
                return 'run';
            }
        }
        /* istanbul ignore next */
        switch (obj.method) {
            case 'insert':
            case 'update':
                return obj.returning ? 'all' : 'run';
            case 'counter':
            case 'del':
                return 'run';
            default:
                return 'all';
        }
    }
    isRunQuery(query) {
        query = query.trim().toLowerCase();
        if ((query.startsWith('insert into') || query.startsWith('update ')) && query.includes(' returning ')) {
            return false;
        }
        return query.startsWith('insert into') ||
            query.startsWith('update') ||
            query.startsWith('delete') ||
            query.startsWith('truncate');
    }
}
exports.SqliteKnexDialect = SqliteKnexDialect;
