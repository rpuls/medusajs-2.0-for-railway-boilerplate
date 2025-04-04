import type { Configuration } from '@mikro-orm/core';
import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class PostgreSqlKnexDialect extends MonkeyPatchable.PostgresDialect {
    ormConfig: Configuration;
    tableCompiler(): any;
    queryCompiler(): any;
}
