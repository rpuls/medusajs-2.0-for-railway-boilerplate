"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroORM = void 0;
const metadata_1 = require("./metadata");
const utils_1 = require("./utils");
const logging_1 = require("./logging");
const cache_1 = require("./cache");
/**
 * Helper class for bootstrapping the MikroORM.
 */
class MikroORM {
    /** The global EntityManager instance. If you are using `RequestContext` helper, it will automatically pick the request specific context under the hood */
    em;
    config;
    metadata;
    driver;
    logger;
    discovery;
    /**
     * Initialize the ORM, load entity metadata, create EntityManager and connect to the database.
     * If you omit the `options` parameter, your CLI config will be used.
     */
    static async init(options) {
        // for back-compatibility only, used by @mikro-orm/nestjs v5
        if (options instanceof utils_1.Configuration) {
            options = options.getAll();
        }
        utils_1.ConfigurationLoader.registerDotenv(options);
        const coreVersion = await utils_1.ConfigurationLoader.checkPackageVersion();
        const env = utils_1.ConfigurationLoader.loadEnvironmentVars();
        if (!options) {
            const configPathFromArg = utils_1.ConfigurationLoader.configPathsFromArg();
            const config = (await utils_1.ConfigurationLoader.getConfiguration(process.env.MIKRO_ORM_CONTEXT_NAME ?? 'default', configPathFromArg ?? utils_1.ConfigurationLoader.getConfigPaths()));
            options = config.getAll();
            if (configPathFromArg) {
                config.getLogger().warn('deprecated', 'Path for config file was inferred from the command line arguments. Instead, you should set the MIKRO_ORM_CLI_CONFIG environment variable to specify the path, or if you really must use the command line arguments, import the config manually based on them, and pass it to init.', { label: 'D0001' });
            }
        }
        options = utils_1.Utils.mergeConfig(options, env);
        await utils_1.ConfigurationLoader.commonJSCompat(options);
        if ('DRIVER' in this && !options.driver) {
            options.driver = this.DRIVER;
        }
        const orm = new MikroORM(options);
        orm.logger.log('info', `MikroORM version: ${logging_1.colors.green(coreVersion)}`);
        // we need to allow global context here as we are not in a scope of requests yet
        const allowGlobalContext = orm.config.get('allowGlobalContext');
        orm.config.set('allowGlobalContext', true);
        await orm.discoverEntities();
        orm.config.set('allowGlobalContext', allowGlobalContext);
        orm.driver.getPlatform().init(orm);
        if (orm.config.get('connect')) {
            await orm.connect();
        }
        for (const extension of orm.config.get('extensions')) {
            extension.register(orm);
        }
        if (orm.config.get('connect') && orm.config.get('ensureIndexes')) {
            await orm.getSchemaGenerator().ensureIndexes();
        }
        return orm;
    }
    /**
     * Synchronous variant of the `init` method with some limitations:
     * - database connection will be established when you first interact with the database (or you can use `orm.connect()` explicitly)
     * - no loading of the `config` file, `options` parameter is mandatory
     * - no support for folder based discovery
     * - no check for mismatched package versions
     */
    static initSync(options) {
        // for back-compatibility only, used by @mikro-orm/nestjs v5
        if (options instanceof utils_1.Configuration) {
            options = options.getAll();
        }
        utils_1.ConfigurationLoader.registerDotenv(options);
        const env = utils_1.ConfigurationLoader.loadEnvironmentVars();
        options = utils_1.Utils.merge(options, env);
        if ('DRIVER' in this && !options.driver) {
            options.driver = this.DRIVER;
        }
        const orm = new MikroORM(options);
        // we need to allow global context here as we are not in a scope of requests yet
        const allowGlobalContext = orm.config.get('allowGlobalContext');
        orm.config.set('allowGlobalContext', true);
        orm.discoverEntitiesSync();
        orm.config.set('allowGlobalContext', allowGlobalContext);
        orm.driver.getPlatform().init(orm);
        for (const extension of orm.config.get('extensions')) {
            extension.register(orm);
        }
        return orm;
    }
    constructor(options) {
        if (options instanceof utils_1.Configuration) {
            this.config = options;
        }
        else {
            this.config = new utils_1.Configuration(options);
        }
        const discovery = this.config.get('discovery');
        if (discovery.disableDynamicFileAccess) {
            this.config.set('metadataProvider', metadata_1.ReflectMetadataProvider);
            this.config.set('metadataCache', { adapter: cache_1.NullCacheAdapter });
            discovery.requireEntitiesArray = true;
        }
        this.driver = this.config.getDriver();
        this.logger = this.config.getLogger();
        this.discovery = new metadata_1.MetadataDiscovery(new metadata_1.MetadataStorage(), this.driver.getPlatform(), this.config);
    }
    /**
     * Connects to the database.
     */
    async connect() {
        const connection = await this.driver.connect();
        const clientUrl = connection.getClientUrl();
        const dbName = this.config.get('dbName');
        const db = dbName + (clientUrl ? ' on ' + clientUrl : '');
        if (this.config.get('ensureDatabase')) {
            const options = this.config.get('ensureDatabase');
            await this.schema.ensureDatabase(typeof options === 'boolean' ? {} : { ...options, forceCheck: true });
        }
        if (await this.isConnected()) {
            this.logger.log('info', `MikroORM successfully connected to database ${logging_1.colors.green(db)}`);
        }
        else {
            this.logger.error('info', `MikroORM failed to connect to database ${db}`);
        }
        return this.driver;
    }
    /**
     * Reconnects, possibly to a different database.
     */
    async reconnect(options = {}) {
        /* istanbul ignore next */
        for (const key of utils_1.Utils.keys(options)) {
            this.config.set(key, options[key]);
        }
        await this.driver.reconnect();
    }
    /**
     * Checks whether the database connection is active.
     */
    async isConnected() {
        return this.driver.getConnection().isConnected();
    }
    /**
     * Checks whether the database connection is active, returns .
     */
    async checkConnection() {
        return this.driver.getConnection().checkConnection();
    }
    /**
     * Closes the database connection.
     */
    async close(force = false) {
        if (await this.isConnected()) {
            await this.driver.close(force);
        }
        if (this.config.getMetadataCacheAdapter()?.close) {
            await this.config.getMetadataCacheAdapter().close();
        }
        if (this.config.getResultCacheAdapter()?.close) {
            await this.config.getResultCacheAdapter().close();
        }
    }
    /**
     * Gets the `MetadataStorage` (without parameters) or `EntityMetadata` instance when provided with the `entityName` parameter.
     */
    getMetadata(entityName) {
        if (entityName) {
            entityName = utils_1.Utils.className(entityName);
            return this.metadata.get(entityName);
        }
        return this.metadata;
    }
    async discoverEntities() {
        this.metadata = await this.discovery.discover(this.config.get('preferTs'));
        this.createEntityManager();
    }
    discoverEntitiesSync() {
        this.metadata = this.discovery.discoverSync(this.config.get('preferTs'));
        this.createEntityManager();
    }
    createEntityManager() {
        this.driver.setMetadata(this.metadata);
        this.em = this.driver.createEntityManager();
        this.em.global = true;
        this.metadata.decorate(this.em);
        this.driver.setMetadata(this.metadata);
    }
    /**
     * Allows dynamically discovering new entity by reference, handy for testing schema diffing.
     */
    discoverEntity(entities, reset) {
        entities = utils_1.Utils.asArray(entities);
        for (const className of utils_1.Utils.asArray(reset)) {
            this.metadata.reset(className);
            this.discovery.reset(className);
        }
        const tmp = this.discovery.discoverReferences(entities);
        const options = this.config.get('discovery');
        new metadata_1.MetadataValidator().validateDiscovered([...Object.values(this.metadata.getAll()), ...tmp], options);
        const metadata = this.discovery.processDiscoveredEntities(tmp);
        metadata.forEach(meta => {
            this.metadata.set(meta.className, meta);
            meta.root = this.metadata.get(meta.root.className);
        });
        this.metadata.decorate(this.em);
    }
    /**
     * Gets the SchemaGenerator.
     */
    getSchemaGenerator() {
        const extension = this.config.getExtension('@mikro-orm/schema-generator');
        if (extension) {
            return extension;
        }
        /* istanbul ignore next */
        throw new Error(`SchemaGenerator extension not registered.`);
    }
    /**
     * Gets the EntityGenerator.
     */
    getEntityGenerator() {
        return this.driver.getPlatform().getExtension('EntityGenerator', '@mikro-orm/entity-generator', '@mikro-orm/entity-generator', this.em);
    }
    /**
     * Gets the Migrator.
     */
    getMigrator() {
        return this.driver.getPlatform().getExtension('Migrator', '@mikro-orm/migrator', '@mikro-orm/migrations', this.em);
    }
    /**
     * Gets the SeedManager
     */
    getSeeder() {
        return this.driver.getPlatform().getExtension('SeedManager', '@mikro-orm/seeder', '@mikro-orm/seeder', this.em);
    }
    /**
     * Shortcut for `orm.getSchemaGenerator()`
     */
    get schema() {
        return this.getSchemaGenerator();
    }
    /**
     * Shortcut for `orm.getSeeder()`
     */
    get seeder() {
        return this.getSeeder();
    }
    /**
     * Shortcut for `orm.getMigrator()`
     */
    get migrator() {
        return this.getMigrator();
    }
    /**
     * Shortcut for `orm.getEntityGenerator()`
     */
    get entityGenerator() {
        return this.getEntityGenerator();
    }
}
exports.MikroORM = MikroORM;
