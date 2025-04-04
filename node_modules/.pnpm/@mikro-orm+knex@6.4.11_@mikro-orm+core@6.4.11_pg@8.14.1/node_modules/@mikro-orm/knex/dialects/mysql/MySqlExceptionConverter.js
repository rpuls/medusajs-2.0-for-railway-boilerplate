"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlExceptionConverter = void 0;
const core_1 = require("@mikro-orm/core");
class MySqlExceptionConverter extends core_1.ExceptionConverter {
    /* istanbul ignore next */
    /**
     * @link http://dev.mysql.com/doc/refman/5.7/en/error-messages-client.html
     * @link http://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html
     * @link https://github.com/doctrine/dbal/blob/master/src/Driver/AbstractMySQLDriver.php
     */
    convertException(exception) {
        switch (exception.errno) {
            case 1213:
                return new core_1.DeadlockException(exception);
            case 1205:
                return new core_1.LockWaitTimeoutException(exception);
            case 1050:
                return new core_1.TableExistsException(exception);
            case 1051:
            case 1146:
                return new core_1.TableNotFoundException(exception);
            case 1216:
            case 1217:
            case 1451:
            case 1452:
            case 1701:
                return new core_1.ForeignKeyConstraintViolationException(exception);
            case 3819:
                return new core_1.CheckConstraintViolationException(exception);
            case 1062:
            case 1557:
            case 1569:
            case 1586:
                return new core_1.UniqueConstraintViolationException(exception);
            case 1054:
            case 1166:
            case 1611:
                return new core_1.InvalidFieldNameException(exception);
            case 1052:
            case 1060:
            case 1110:
                return new core_1.NonUniqueFieldNameException(exception);
            case 1064:
            case 1149:
            case 1287:
            case 1341:
            case 1342:
            case 1343:
            case 1344:
            case 1382:
            case 1479:
            case 1541:
            case 1554:
            case 1626:
                return new core_1.SyntaxErrorException(exception);
            case 1044:
            case 1045:
            case 1046:
            case 1049:
            case 1095:
            case 1142:
            case 1143:
            case 1227:
            case 1370:
            case 1429:
            case 2002:
            case 2005:
                return new core_1.ConnectionException(exception);
            case 1048:
            case 1121:
            case 1138:
            case 1171:
            case 1252:
            case 1263:
            case 1364:
            case 1566:
                return new core_1.NotNullConstraintViolationException(exception);
        }
        return super.convertException(exception);
    }
}
exports.MySqlExceptionConverter = MySqlExceptionConverter;
