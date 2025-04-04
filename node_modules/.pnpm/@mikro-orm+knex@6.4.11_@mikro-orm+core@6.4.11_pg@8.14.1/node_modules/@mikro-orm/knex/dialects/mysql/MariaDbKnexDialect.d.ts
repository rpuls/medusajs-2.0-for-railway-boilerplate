import { MySqlKnexDialect } from './MySqlKnexDialect';
export declare class MariaDbKnexDialect extends MySqlKnexDialect {
    get driverName(): string;
    _driver(): any;
    validateConnection(connection: any): any;
}
