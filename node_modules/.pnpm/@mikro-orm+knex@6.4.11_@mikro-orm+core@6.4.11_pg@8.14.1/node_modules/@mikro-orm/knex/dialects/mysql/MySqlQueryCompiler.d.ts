import BaseMySqlQueryCompiler from 'knex/lib/dialects/mysql/query/mysql-querycompiler';
export declare class MySqlQueryCompiler extends BaseMySqlQueryCompiler {
    whereBasic(statement: any): any;
    whereRaw(statement: any): any;
}
