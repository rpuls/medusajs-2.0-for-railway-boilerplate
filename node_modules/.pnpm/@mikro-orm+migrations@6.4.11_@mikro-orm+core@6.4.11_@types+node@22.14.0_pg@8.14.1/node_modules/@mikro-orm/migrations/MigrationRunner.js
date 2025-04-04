"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationRunner = void 0;
const core_1 = require("@mikro-orm/core");
class MigrationRunner {
    driver;
    options;
    config;
    connection;
    helper;
    masterTransaction;
    constructor(driver, options, config) {
        this.driver = driver;
        this.options = options;
        this.config = config;
        this.connection = this.driver.getConnection();
        this.helper = this.driver.getPlatform().getSchemaHelper();
    }
    async run(migration, method) {
        migration.reset();
        if (!this.options.transactional || !migration.isTransactional()) {
            const queries = await this.getQueries(migration, method);
            await core_1.Utils.runSerial(queries, sql => this.driver.execute(sql));
        }
        else {
            await this.connection.transactional(async (tx) => {
                migration.setTransactionContext(tx);
                const queries = await this.getQueries(migration, method);
                await core_1.Utils.runSerial(queries, sql => this.driver.execute(sql, undefined, 'all', tx));
            }, { ctx: this.masterTransaction });
        }
    }
    setMasterMigration(trx) {
        this.masterTransaction = trx;
    }
    unsetMasterMigration() {
        delete this.masterTransaction;
    }
    async getQueries(migration, method) {
        await migration[method]();
        const charset = this.config.get('charset');
        let queries = migration.getQueries();
        queries.unshift(...this.helper.getSchemaBeginning(charset, this.options.disableForeignKeys).split('\n'));
        queries.push(...this.helper.getSchemaEnd(this.options.disableForeignKeys).split('\n'));
        queries = queries.filter(sql => !core_1.Utils.isString(sql) || sql.trim().length > 0);
        return queries;
    }
}
exports.MigrationRunner = MigrationRunner;
