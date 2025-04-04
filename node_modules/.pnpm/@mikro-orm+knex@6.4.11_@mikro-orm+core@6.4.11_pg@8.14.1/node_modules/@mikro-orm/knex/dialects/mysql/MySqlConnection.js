"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const MySqlKnexDialect_1 = require("./MySqlKnexDialect");
const AbstractSqlConnection_1 = require("../../AbstractSqlConnection");
class MySqlConnection extends AbstractSqlConnection_1.AbstractSqlConnection {
    createKnex() {
        this.client = this.createKnexClient(MySqlKnexDialect_1.MySqlKnexDialect);
        this.connected = true;
    }
    getDefaultClientUrl() {
        return 'mysql://root@127.0.0.1:3306';
    }
    getConnectionOptions() {
        const ret = super.getConnectionOptions();
        if (this.config.get('multipleStatements')) {
            ret.multipleStatements = this.config.get('multipleStatements');
        }
        if (this.config.get('forceUtcTimezone')) {
            ret.timezone = 'Z';
        }
        if (this.config.get('timezone')) {
            ret.timezone = this.config.get('timezone');
        }
        ret.supportBigNumbers = true;
        ret.dateStrings = true;
        return ret;
    }
    transformRawResult(res, method) {
        if (method === 'run' && ['OkPacket', 'ResultSetHeader'].includes(res[0].constructor.name)) {
            return {
                insertId: res[0].insertId,
                affectedRows: res[0].affectedRows,
                rows: [],
            };
        }
        if (method === 'get') {
            return res[0][0];
        }
        return res[0];
    }
}
exports.MySqlConnection = MySqlConnection;
