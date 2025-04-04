"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MariaDbKnexDialect = void 0;
const MySqlKnexDialect_1 = require("./MySqlKnexDialect");
class MariaDbKnexDialect extends MySqlKnexDialect_1.MySqlKnexDialect {
    get driverName() {
        return 'mariadb';
    }
    _driver() {
        return require('mariadb/callback');
    }
    validateConnection(connection) {
        return connection.isValid();
    }
}
exports.MariaDbKnexDialect = MariaDbKnexDialect;
