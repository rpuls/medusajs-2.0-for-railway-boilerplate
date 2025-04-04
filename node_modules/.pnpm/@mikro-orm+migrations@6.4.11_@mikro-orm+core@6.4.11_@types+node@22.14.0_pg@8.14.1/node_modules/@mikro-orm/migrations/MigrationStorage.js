"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationStorage = void 0;
const path = __importStar(require("node:path"));
class MigrationStorage {
    driver;
    options;
    connection;
    helper;
    masterTransaction;
    constructor(driver, options) {
        this.driver = driver;
        this.options = options;
        this.connection = this.driver.getConnection();
        this.helper = this.driver.getPlatform().getSchemaHelper();
    }
    async executed() {
        const migrations = await this.getExecutedMigrations();
        return migrations.map(({ name }) => `${this.getMigrationName(name)}`);
    }
    async logMigration(params) {
        const { tableName, schemaName } = this.getTableName();
        const name = this.getMigrationName(params.name);
        await this.driver.nativeInsert(tableName, { name }, { schema: schemaName, ctx: this.masterTransaction });
    }
    async unlogMigration(params) {
        const { tableName, schemaName } = this.getTableName();
        const withoutExt = this.getMigrationName(params.name);
        const names = [withoutExt, withoutExt + '.js', withoutExt + '.ts'];
        const qb = this.knex.delete().from(tableName).withSchema(schemaName).where('name', 'in', [params.name, ...names]);
        if (this.masterTransaction) {
            qb.transacting(this.masterTransaction);
        }
        await this.connection.execute(qb);
    }
    async getExecutedMigrations() {
        const { tableName, schemaName } = this.getTableName();
        const qb = this.knex.select('*').from(tableName).withSchema(schemaName).orderBy('id', 'asc');
        if (this.masterTransaction) {
            qb.transacting(this.masterTransaction);
        }
        const res = await this.connection.execute(qb);
        return res.map(row => {
            if (typeof row.executed_at === 'string') {
                row.executed_at = new Date(row.executed_at);
            }
            return row;
        });
    }
    async ensureTable() {
        const tables = await this.connection.execute(this.helper.getListTablesSQL(), [], 'all', this.masterTransaction);
        const { tableName, schemaName } = this.getTableName();
        if (tables.find(t => t.table_name === tableName && (!t.schema_name || t.schema_name === schemaName))) {
            return;
        }
        const schemas = await this.helper.getNamespaces(this.connection);
        if (schemaName && !schemas.includes(schemaName)) {
            const sql = this.helper.getCreateNamespaceSQL(schemaName);
            await this.connection.execute(sql);
        }
        await this.knex.schema.createTable(tableName, table => {
            table.increments();
            table.string('name');
            table.dateTime('executed_at').defaultTo(this.knex.fn.now());
        }).withSchema(schemaName);
    }
    setMasterMigration(trx) {
        this.masterTransaction = trx;
    }
    unsetMasterMigration() {
        delete this.masterTransaction;
    }
    /**
     * @internal
     */
    getMigrationName(name) {
        const parsedName = path.parse(name);
        if (['.js', '.ts'].includes(parsedName.ext)) {
            // strip extension
            return parsedName.name;
        }
        return name;
    }
    /**
     * @internal
     */
    getTableName() {
        const parts = this.options.tableName.split('.');
        const tableName = parts.length > 1 ? parts[1] : parts[0];
        const schemaName = parts.length > 1 ? parts[0] : this.driver.config.get('schema', this.driver.getPlatform().getDefaultSchemaName());
        return { tableName, schemaName };
    }
    get knex() {
        return this.connection.getKnex();
    }
}
exports.MigrationStorage = MigrationStorage;
