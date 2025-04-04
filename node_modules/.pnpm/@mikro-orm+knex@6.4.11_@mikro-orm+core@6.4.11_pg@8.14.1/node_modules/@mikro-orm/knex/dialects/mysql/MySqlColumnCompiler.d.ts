import BaseMySqlColumnCompiler from 'knex/lib/dialects/mysql/schema/mysql-columncompiler';
import type { MySqlIncrementOptions } from '../../typings';
export declare class MySqlColumnCompiler extends BaseMySqlColumnCompiler {
    increments(options: MySqlIncrementOptions): string;
    bigincrements(options: MySqlIncrementOptions): string;
    private generateDDL;
}
