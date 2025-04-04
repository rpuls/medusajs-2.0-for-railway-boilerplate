import { ExceptionConverter, type Dictionary, type DriverException } from '@mikro-orm/core';
export declare class MySqlExceptionConverter extends ExceptionConverter {
    /**
     * @link http://dev.mysql.com/doc/refman/5.7/en/error-messages-client.html
     * @link http://dev.mysql.com/doc/refman/5.7/en/error-messages-server.html
     * @link https://github.com/doctrine/dbal/blob/master/src/Driver/AbstractMySQLDriver.php
     */
    convertException(exception: Error & Dictionary): DriverException;
}
