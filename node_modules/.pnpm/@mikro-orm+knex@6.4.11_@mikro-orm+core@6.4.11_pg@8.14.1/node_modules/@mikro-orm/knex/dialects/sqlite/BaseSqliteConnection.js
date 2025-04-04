"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSqliteConnection = void 0;
const fs_extra_1 = require("fs-extra");
const node_path_1 = require("node:path");
const AbstractSqlConnection_1 = require("../../AbstractSqlConnection");
const core_1 = require("@mikro-orm/core");
class BaseSqliteConnection extends AbstractSqlConnection_1.AbstractSqlConnection {
    async connect() {
        this.createKnex();
        const dbName = this.config.get('dbName');
        if (dbName && dbName !== ':memory:') {
            await (0, fs_extra_1.ensureDir)((0, node_path_1.dirname)(this.config.get('dbName')));
        }
        await this.client.raw('pragma foreign_keys = on');
    }
    getDefaultClientUrl() {
        return '';
    }
    getClientUrl() {
        return '';
    }
    async loadFile(path) {
        const conn = await this.client.client.acquireConnection();
        await conn.exec((await (0, fs_extra_1.readFile)(path)).toString());
        await this.client.client.releaseConnection(conn);
    }
    getKnexOptions(type) {
        return core_1.Utils.mergeConfig({
            client: type,
            connection: {
                filename: this.config.get('dbName'),
            },
            pool: this.config.get('pool'),
            useNullAsDefault: true,
        }, this.config.get('driverOptions'));
    }
    transformRawResult(res, method) {
        if (method === 'get') {
            return res[0];
        }
        if (method === 'all') {
            return res;
        }
        if (Array.isArray(res)) {
            return {
                insertId: res[res.length - 1]?.id ?? 0,
                affectedRows: res.length,
                row: res[0],
                rows: res,
            };
        }
        return {
            insertId: res.lastInsertRowid,
            affectedRows: res.changes,
        };
    }
}
exports.BaseSqliteConnection = BaseSqliteConnection;
