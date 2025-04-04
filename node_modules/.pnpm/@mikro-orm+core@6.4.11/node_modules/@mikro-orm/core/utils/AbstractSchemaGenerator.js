"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractSchemaGenerator = void 0;
const CommitOrderCalculator_1 = require("../unit-of-work/CommitOrderCalculator");
const EntityManager_1 = require("../EntityManager");
class AbstractSchemaGenerator {
    em;
    driver;
    config;
    metadata;
    platform;
    connection;
    constructor(em) {
        this.em = em instanceof EntityManager_1.EntityManager ? em : undefined;
        this.driver = em instanceof EntityManager_1.EntityManager ? em.getDriver() : em;
        this.config = this.driver.config;
        this.metadata = this.driver.getMetadata();
        this.platform = this.driver.getPlatform();
        this.connection = this.driver.getConnection();
    }
    async createSchema(options) {
        this.notImplemented();
    }
    /**
     * Returns true if the database was created.
     */
    async ensureDatabase(options) {
        this.notImplemented();
    }
    async refreshDatabase(options) {
        if (options?.dropDb) {
            const name = this.config.get('dbName');
            await this.dropDatabase(name);
            await this.createDatabase(name);
        }
        else {
            await this.ensureDatabase();
            await this.dropSchema(options);
        }
        await this.createSchema(options);
    }
    async clearDatabase(options) {
        for (const meta of this.getOrderedMetadata(options?.schema).reverse()) {
            await this.driver.nativeDelete(meta.className, {}, options);
        }
        this.clearIdentityMap();
    }
    clearIdentityMap() {
        /* istanbul ignore next */
        if (!this.em) {
            return;
        }
        const allowGlobalContext = this.config.get('allowGlobalContext');
        this.config.set('allowGlobalContext', true);
        this.em.clear();
        this.config.set('allowGlobalContext', allowGlobalContext);
    }
    async getCreateSchemaSQL(options) {
        this.notImplemented();
    }
    async dropSchema(options) {
        this.notImplemented();
    }
    async getDropSchemaSQL(options) {
        this.notImplemented();
    }
    async updateSchema(options) {
        this.notImplemented();
    }
    async getUpdateSchemaSQL(options) {
        this.notImplemented();
    }
    async getUpdateSchemaMigrationSQL(options) {
        this.notImplemented();
    }
    /**
     * creates new database and connects to it
     */
    async createDatabase(name) {
        this.notImplemented();
    }
    async dropDatabase(name) {
        this.notImplemented();
    }
    async execute(query) {
        this.notImplemented();
    }
    async ensureIndexes() {
        this.notImplemented();
    }
    getOrderedMetadata(schema) {
        const metadata = Object.values(this.metadata.getAll()).filter(meta => {
            const isRootEntity = meta.root.className === meta.className;
            return isRootEntity && !meta.embeddable && !meta.virtual;
        });
        const calc = new CommitOrderCalculator_1.CommitOrderCalculator();
        metadata.forEach(meta => calc.addNode(meta.root.className));
        let meta = metadata.pop();
        while (meta) {
            for (const prop of meta.props) {
                calc.discoverProperty(prop, meta.root.className);
            }
            meta = metadata.pop();
        }
        return calc.sort()
            .map(cls => this.metadata.find(cls))
            .filter(meta => {
            const targetSchema = meta.schema ?? this.config.get('schema', this.platform.getDefaultSchemaName());
            return schema ? [schema, '*'].includes(targetSchema) : meta.schema !== '*';
        });
    }
    notImplemented() {
        throw new Error(`This method is not supported by ${this.driver.constructor.name} driver`);
    }
}
exports.AbstractSchemaGenerator = AbstractSchemaGenerator;
