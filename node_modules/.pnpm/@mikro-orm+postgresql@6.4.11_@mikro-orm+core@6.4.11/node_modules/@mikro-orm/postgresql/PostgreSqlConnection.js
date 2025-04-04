"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSqlConnection = void 0;
const type_overrides_1 = __importDefault(require("pg/lib/type-overrides"));
const postgres_array_1 = __importDefault(require("postgres-array"));
const knex_1 = require("@mikro-orm/knex");
class PostgreSqlConnection extends knex_1.AbstractSqlConnection {
    createKnex() {
        this.client = this.createKnexClient(knex_1.PostgreSqlKnexDialect);
        this.client.client.ormConfig = this.config;
        this.connected = true;
    }
    getDefaultClientUrl() {
        return 'postgresql://postgres@127.0.0.1:5432';
    }
    getConnectionOptions() {
        const ret = super.getConnectionOptions();
        // use `select typname, oid, typarray from pg_type order by oid` to get the list of OIDs
        const types = new type_overrides_1.default();
        [
            1082, // date
            1114, // timestamp
            1184, // timestamptz
            1186, // interval
        ].forEach(oid => types.setTypeParser(oid, str => str));
        [
            1182, // date[]
            1115, // timestamp[]
            1185, // timestamptz[]
            1187, // interval[]
        ].forEach(oid => types.setTypeParser(oid, str => postgres_array_1.default.parse(str)));
        ret.types = types;
        return ret;
    }
    transformRawResult(res, method) {
        if (Array.isArray(res)) {
            return res.map(row => this.transformRawResult(row, method));
        }
        if (method === 'get') {
            return res.rows[0];
        }
        if (method === 'all') {
            return res.rows;
        }
        return {
            affectedRows: res.rowCount,
            insertId: res.rows[0] ? res.rows[0].id : 0,
            row: res.rows[0],
            rows: res.rows,
        };
    }
}
exports.PostgreSqlConnection = PostgreSqlConnection;
