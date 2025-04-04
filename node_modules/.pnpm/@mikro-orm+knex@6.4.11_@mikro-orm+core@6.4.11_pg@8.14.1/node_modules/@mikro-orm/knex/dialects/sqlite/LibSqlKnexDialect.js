"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibSqlKnexDialect = void 0;
const SqliteTableCompiler_1 = require("./SqliteTableCompiler");
const MonkeyPatchable_1 = require("../../MonkeyPatchable");
class LibSqlKnexDialect extends MonkeyPatchable_1.MonkeyPatchable.BetterSqlite3Dialect {
    get driverName() {
        return 'libsql';
    }
    _driver() {
        return require('libsql');
    }
    async _query(connection, obj) {
        /* istanbul ignore next */
        if (!obj.sql) {
            throw new Error('The query is empty');
        }
        /* istanbul ignore next */
        if (!connection) {
            throw new Error('No connection provided');
        }
        const callMethod = this.getCallMethod(obj);
        const statement = connection.prepare(obj.sql);
        const bindings = this._formatBindings(obj.bindings);
        const response = await statement[callMethod](bindings);
        obj.response = response;
        obj.context = {
            lastID: response.lastInsertRowid,
            changes: response.changes,
        };
        return obj;
    }
    async acquireRawConnection() {
        const connection = new this.driver(this.connectionSettings.filename, {
            ...this.connectionSettings,
        });
        connection.__created = Date.now();
        return connection;
    }
    tableCompiler() {
        // eslint-disable-next-line prefer-rest-params
        return new SqliteTableCompiler_1.SqliteTableCompiler(this, ...arguments);
    }
    validateConnection(connection) {
        if (connection.memory) {
            return true;
        }
        /* istanbul ignore next */
        return connection.__created > Date.now() - 10_000;
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
        /* istanbul ignore next */
        if ((query.startsWith('insert into') || query.startsWith('update ')) && query.includes(' returning ')) {
            return false;
        }
        return query.startsWith('insert into') ||
            query.startsWith('update') ||
            query.startsWith('delete') ||
            query.startsWith('truncate');
    }
}
exports.LibSqlKnexDialect = LibSqlKnexDialect;
