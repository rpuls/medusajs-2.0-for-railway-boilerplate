"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationLoader = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = require("fs-extra");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const colors_1 = require("../logging/colors");
const Configuration_1 = require("./Configuration");
const Utils_1 = require("./Utils");
/**
 * @internal
 */
class ConfigurationLoader {
    static async getConfiguration(contextName = 'default', paths = ConfigurationLoader.getConfigPaths(), options = {}) {
        // Backwards compatibility layer
        if (typeof contextName === 'boolean' || !Array.isArray(paths)) {
            this.commonJSCompat(options);
            this.registerDotenv(options);
            const configPathFromArg = ConfigurationLoader.configPathsFromArg();
            const configPaths = configPathFromArg ?? (Array.isArray(paths) ? paths : ConfigurationLoader.getConfigPaths());
            const config = contextName
                ? (await ConfigurationLoader.getConfiguration(process.env.MIKRO_ORM_CONTEXT_NAME ?? 'default', configPaths, Array.isArray(paths) ? {} : paths))
                : await (async () => {
                    const env = this.loadEnvironmentVars();
                    const [path, tmp] = await this.getConfigFile(configPaths);
                    if (!path) {
                        if (Utils_1.Utils.hasObjectKeys(env)) {
                            return new Configuration_1.Configuration(Utils_1.Utils.mergeConfig({}, options, env), false);
                        }
                        throw new Error(`MikroORM config file not found in ['${configPaths.join(`', '`)}']`);
                    }
                    return new Configuration_1.Configuration(Utils_1.Utils.mergeConfig(tmp, options, env), false);
                })();
            if (configPathFromArg) {
                config.getLogger().warn('deprecated', 'Path for config file was inferred from the command line arguments. Instead, you should set the MIKRO_ORM_CLI_CONFIG environment variable to specify the path, or if you really must use the command line arguments, import the config manually based on them, and pass it to init.', { label: 'D0001' });
            }
            return config;
        }
        const env = this.loadEnvironmentVars();
        const configFinder = (cfg) => {
            return typeof cfg === 'object' && cfg !== null && ('contextName' in cfg ? cfg.contextName === contextName : (contextName === 'default'));
        };
        const isValidConfigFactoryResult = (cfg) => {
            return typeof cfg === 'object' && cfg !== null && (!('contextName' in cfg) || cfg.contextName === contextName);
        };
        const result = await this.getConfigFile(paths);
        if (!result[0]) {
            if (Utils_1.Utils.hasObjectKeys(env)) {
                return new Configuration_1.Configuration(Utils_1.Utils.mergeConfig({ contextName }, options, env));
            }
            throw new Error(`MikroORM config file not found in ['${paths.join(`', '`)}']`);
        }
        const path = result[0];
        let tmp = result[1];
        if (Array.isArray(tmp)) {
            const tmpFirstIndex = tmp.findIndex(configFinder);
            if (tmpFirstIndex === -1) {
                // Static config not found. Try factory functions
                let configCandidate;
                for (let i = 0, l = tmp.length; i < l; ++i) {
                    const f = tmp[i];
                    if (typeof f !== 'function') {
                        continue;
                    }
                    configCandidate = await f(contextName);
                    if (!isValidConfigFactoryResult(configCandidate)) {
                        continue;
                    }
                    tmp = configCandidate;
                    break;
                }
                if (Array.isArray(tmp)) {
                    throw new Error(`MikroORM config '${contextName}' was not found within the config file '${path}'. Either add a config with this name to the array, or add a function that when given this name will return a configuration object without a name, or with name set to this name.`);
                }
            }
            else {
                const tmpLastIndex = tmp.findLastIndex(configFinder);
                if (tmpLastIndex !== tmpFirstIndex) {
                    throw new Error(`MikroORM config '${contextName}' is not unique within the array exported by '${path}' (first occurrence index: ${tmpFirstIndex}; last occurrence index: ${tmpLastIndex})`);
                }
                tmp = tmp[tmpFirstIndex];
            }
        }
        else {
            if (tmp instanceof Function) {
                tmp = await tmp(contextName);
                if (!isValidConfigFactoryResult(tmp)) {
                    throw new Error(`MikroORM config '${contextName}' was not what the function exported from '${path}' provided. Ensure it returns a config object with no name, or name matching the requested one.`);
                }
            }
            else {
                if (!configFinder(tmp)) {
                    throw new Error(`MikroORM config '${contextName}' was not what the default export from '${path}' provided.`);
                }
            }
        }
        const esmConfigOptions = this.isESM() ? { entityGenerator: { esmImport: true } } : {};
        return new Configuration_1.Configuration(Utils_1.Utils.mergeConfig({}, esmConfigOptions, tmp, options, env));
    }
    static async getConfigFile(paths) {
        for (let path of paths) {
            path = Utils_1.Utils.absolutePath(path);
            path = Utils_1.Utils.normalizePath(path);
            if ((0, fs_extra_1.pathExistsSync)(path)) {
                const config = await Utils_1.Utils.dynamicImport(path);
                /* istanbul ignore next */
                return [path, await (config.default ?? config)];
            }
        }
        return [];
    }
    static getPackageConfig(basePath = process.cwd()) {
        if ((0, fs_extra_1.pathExistsSync)(`${basePath}/package.json`)) {
            /* istanbul ignore next */
            try {
                return (0, fs_extra_1.readJSONSync)(`${basePath}/package.json`);
            }
            catch {
                return {};
            }
        }
        const parentFolder = (0, fs_extra_1.realpathSync)(`${basePath}/..`);
        // we reached the root folder
        if (basePath === parentFolder) {
            return {};
        }
        return this.getPackageConfig(parentFolder);
    }
    static getSettings() {
        const config = ConfigurationLoader.getPackageConfig();
        const settings = { ...config['mikro-orm'] };
        const bool = (v) => ['true', 't', '1'].includes(v.toLowerCase());
        settings.useTsNode = process.env.MIKRO_ORM_CLI_USE_TS_NODE != null ? bool(process.env.MIKRO_ORM_CLI_USE_TS_NODE) : settings.useTsNode;
        settings.tsConfigPath = process.env.MIKRO_ORM_CLI_TS_CONFIG_PATH ?? settings.tsConfigPath;
        settings.alwaysAllowTs = process.env.MIKRO_ORM_CLI_ALWAYS_ALLOW_TS != null ? bool(process.env.MIKRO_ORM_CLI_ALWAYS_ALLOW_TS) : settings.alwaysAllowTs;
        settings.verbose = process.env.MIKRO_ORM_CLI_VERBOSE != null ? bool(process.env.MIKRO_ORM_CLI_VERBOSE) : settings.verbose;
        if (process.env.MIKRO_ORM_CLI_CONFIG?.endsWith('.ts')) {
            settings.useTsNode = true;
        }
        return settings;
    }
    static configPathsFromArg() {
        const options = Utils_1.Utils.parseArgs();
        const configArgName = process.env.MIKRO_ORM_CONFIG_ARG_NAME ?? 'config';
        if (options[configArgName]) {
            return [options[configArgName]];
        }
        return undefined;
    }
    static getConfigPaths() {
        const paths = [];
        const settings = ConfigurationLoader.getSettings();
        if (process.env.MIKRO_ORM_CLI_CONFIG) {
            paths.push(process.env.MIKRO_ORM_CLI_CONFIG);
        }
        paths.push(...(settings.configPaths || []));
        const alwaysAllowTs = settings.alwaysAllowTs ?? process.versions.bun;
        if (settings.useTsNode !== false || alwaysAllowTs) {
            paths.push('./src/mikro-orm.config.ts');
            paths.push('./mikro-orm.config.ts');
        }
        const distDir = (0, fs_extra_1.pathExistsSync)(process.cwd() + '/dist');
        const buildDir = (0, fs_extra_1.pathExistsSync)(process.cwd() + '/build');
        /* istanbul ignore next */
        const path = distDir ? 'dist' : (buildDir ? 'build' : 'src');
        paths.push(`./${path}/mikro-orm.config.js`);
        paths.push('./mikro-orm.config.js');
        const tsNode = Utils_1.Utils.detectTsNode();
        return Utils_1.Utils.unique(paths).filter(p => p.endsWith('.js') || tsNode || alwaysAllowTs);
    }
    static isESM() {
        const config = ConfigurationLoader.getPackageConfig();
        const type = config?.type ?? '';
        return type === 'module';
    }
    static registerTsNode(configPath = 'tsconfig.json') {
        /* istanbul ignore next */
        if (process.versions.bun) {
            return true;
        }
        const tsConfigPath = (0, node_path_1.isAbsolute)(configPath) ? configPath : (0, node_path_1.join)(process.cwd(), configPath);
        const tsNode = Utils_1.Utils.tryRequire({
            module: 'ts-node',
            from: tsConfigPath,
            warning: 'ts-node not installed, support for working with TS files might not work',
        });
        /* istanbul ignore next */
        if (!tsNode) {
            return false;
        }
        const { options } = tsNode.register({
            project: tsConfigPath,
            transpileOnly: true,
            compilerOptions: {
                module: 'nodenext',
                moduleResolution: 'nodenext',
            },
        }).config;
        if (Object.entries(options?.paths ?? {}).length > 0) {
            Utils_1.Utils.requireFrom('tsconfig-paths', tsConfigPath).register({
                baseUrl: options.baseUrl ?? '.',
                paths: options.paths,
            });
        }
        return true;
    }
    static registerDotenv(options) {
        const baseDir = options instanceof Configuration_1.Configuration ? options.get('baseDir') : options?.baseDir;
        const path = process.env.MIKRO_ORM_ENV ?? ((baseDir ?? process.cwd()) + '/.env');
        const env = {};
        dotenv_1.default.config({ path, processEnv: env });
        // only propagate known env vars
        for (const key of Object.keys(env)) {
            if (key.startsWith('MIKRO_ORM_')) {
                process.env[key] ??= env[key]; // respect user provided values
            }
        }
    }
    static loadEnvironmentVars() {
        const ret = {};
        // only to keep some sort of back compatibility with those using env vars only, to support `MIKRO_ORM_TYPE`
        const PLATFORMS = {
            'mongo': { className: 'MongoDriver', module: '@mikro-orm/mongodb' },
            'mysql': { className: 'MySqlDriver', module: '@mikro-orm/mysql' },
            'mssql': { className: 'MsSqlDriver', module: '@mikro-orm/mssql' },
            'mariadb': { className: 'MariaDbDriver', module: '@mikro-orm/mariadb' },
            'postgresql': { className: 'PostgreSqlDriver', module: '@mikro-orm/postgresql' },
            'sqlite': { className: 'SqliteDriver', module: '@mikro-orm/sqlite' },
            'better-sqlite': { className: 'BetterSqliteDriver', module: '@mikro-orm/better-sqlite' },
            'libsql': { className: 'LibSqlDriver', module: '@mikro-orm/libsql' },
        };
        const array = (v) => v.split(',').map(vv => vv.trim());
        const bool = (v) => ['true', 't', '1'].includes(v.toLowerCase());
        const num = (v) => +v;
        const driver = (v) => Utils_1.Utils.requireFrom(PLATFORMS[v].module)[PLATFORMS[v].className];
        const read = (o, envKey, key, mapper = v => v) => {
            if (!(envKey in process.env)) {
                return;
            }
            const val = process.env[envKey];
            o[key] = mapper(val);
        };
        const cleanup = (o, k) => Utils_1.Utils.hasObjectKeys(o[k]) ? {} : delete o[k];
        read(ret, 'MIKRO_ORM_BASE_DIR', 'baseDir');
        read(ret, 'MIKRO_ORM_TYPE', 'driver', driver);
        read(ret, 'MIKRO_ORM_ENTITIES', 'entities', array);
        read(ret, 'MIKRO_ORM_ENTITIES_TS', 'entitiesTs', array);
        read(ret, 'MIKRO_ORM_CLIENT_URL', 'clientUrl');
        read(ret, 'MIKRO_ORM_HOST', 'host');
        read(ret, 'MIKRO_ORM_PORT', 'port', num);
        read(ret, 'MIKRO_ORM_USER', 'user');
        read(ret, 'MIKRO_ORM_PASSWORD', 'password');
        read(ret, 'MIKRO_ORM_DB_NAME', 'dbName');
        read(ret, 'MIKRO_ORM_SCHEMA', 'schema');
        read(ret, 'MIKRO_ORM_LOAD_STRATEGY', 'loadStrategy');
        read(ret, 'MIKRO_ORM_BATCH_SIZE', 'batchSize', num);
        read(ret, 'MIKRO_ORM_USE_BATCH_INSERTS', 'useBatchInserts', bool);
        read(ret, 'MIKRO_ORM_USE_BATCH_UPDATES', 'useBatchUpdates', bool);
        read(ret, 'MIKRO_ORM_STRICT', 'strict', bool);
        read(ret, 'MIKRO_ORM_VALIDATE', 'validate', bool);
        read(ret, 'MIKRO_ORM_ALLOW_GLOBAL_CONTEXT', 'allowGlobalContext', bool);
        read(ret, 'MIKRO_ORM_AUTO_JOIN_ONE_TO_ONE_OWNER', 'autoJoinOneToOneOwner', bool);
        read(ret, 'MIKRO_ORM_POPULATE_AFTER_FLUSH', 'populateAfterFlush', bool);
        read(ret, 'MIKRO_ORM_FORCE_ENTITY_CONSTRUCTOR', 'forceEntityConstructor', bool);
        read(ret, 'MIKRO_ORM_FORCE_UNDEFINED', 'forceUndefined', bool);
        read(ret, 'MIKRO_ORM_FORCE_UTC_TIMEZONE', 'forceUtcTimezone', bool);
        read(ret, 'MIKRO_ORM_TIMEZONE', 'timezone');
        read(ret, 'MIKRO_ORM_ENSURE_INDEXES', 'ensureIndexes', bool);
        read(ret, 'MIKRO_ORM_IMPLICIT_TRANSACTIONS', 'implicitTransactions', bool);
        read(ret, 'MIKRO_ORM_DEBUG', 'debug', bool);
        read(ret, 'MIKRO_ORM_COLORS', 'colors', bool);
        ret.discovery = {};
        read(ret.discovery, 'MIKRO_ORM_DISCOVERY_WARN_WHEN_NO_ENTITIES', 'warnWhenNoEntities', bool);
        read(ret.discovery, 'MIKRO_ORM_DISCOVERY_REQUIRE_ENTITIES_ARRAY', 'requireEntitiesArray', bool);
        read(ret.discovery, 'MIKRO_ORM_DISCOVERY_ALWAYS_ANALYSE_PROPERTIES', 'alwaysAnalyseProperties', bool);
        read(ret.discovery, 'MIKRO_ORM_DISCOVERY_DISABLE_DYNAMIC_FILE_ACCESS', 'disableDynamicFileAccess', bool);
        cleanup(ret, 'discovery');
        ret.migrations = {};
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_TABLE_NAME', 'tableName');
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_PATH', 'path');
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_PATH_TS', 'pathTs');
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_GLOB', 'glob');
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_TRANSACTIONAL', 'transactional', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_DISABLE_FOREIGN_KEYS', 'disableForeignKeys', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_ALL_OR_NOTHING', 'allOrNothing', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_DROP_TABLES', 'dropTables', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_SAFE', 'safe', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_SILENT', 'silent', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_EMIT', 'emit');
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_SNAPSHOT', 'snapshot', bool);
        read(ret.migrations, 'MIKRO_ORM_MIGRATIONS_SNAPSHOT_NAME', 'snapshotName');
        cleanup(ret, 'migrations');
        ret.schemaGenerator = {};
        read(ret.schemaGenerator, 'MIKRO_ORM_SCHEMA_GENERATOR_DISABLE_FOREIGN_KEYS', 'disableForeignKeys', bool);
        read(ret.schemaGenerator, 'MIKRO_ORM_SCHEMA_GENERATOR_CREATE_FOREIGN_KEY_CONSTRAINTS', 'createForeignKeyConstraints', bool);
        cleanup(ret, 'schemaGenerator');
        ret.seeder = {};
        read(ret.seeder, 'MIKRO_ORM_SEEDER_PATH', 'path');
        read(ret.seeder, 'MIKRO_ORM_SEEDER_PATH_TS', 'pathTs');
        read(ret.seeder, 'MIKRO_ORM_SEEDER_GLOB', 'glob');
        read(ret.seeder, 'MIKRO_ORM_SEEDER_EMIT', 'emit');
        read(ret.seeder, 'MIKRO_ORM_SEEDER_DEFAULT_SEEDER', 'defaultSeeder');
        cleanup(ret, 'seeder');
        return ret;
    }
    static getORMPackages() {
        const pkg = this.getPackageConfig();
        return new Set([
            ...Object.keys(pkg.dependencies ?? {}),
            ...Object.keys(pkg.devDependencies ?? {}),
        ]);
    }
    /** @internal */
    static commonJSCompat(options) {
        if (this.isESM()) {
            return;
        }
        /* istanbul ignore next */
        options.dynamicImportProvider ??= id => {
            if ((0, node_os_1.platform)() === 'win32') {
                try {
                    id = (0, node_url_1.fileURLToPath)(id);
                }
                catch {
                    // ignore
                }
            }
            return Utils_1.Utils.requireFrom(id);
        };
        Utils_1.Utils.setDynamicImportProvider(options.dynamicImportProvider);
    }
    static getORMPackageVersion(name) {
        /* istanbul ignore next */
        try {
            const pkg = Utils_1.Utils.requireFrom(`${name}/package.json`);
            return pkg?.version;
        }
        catch (e) {
            return undefined;
        }
    }
    // inspired by https://github.com/facebook/docusaurus/pull/3386
    static checkPackageVersion() {
        const coreVersion = Utils_1.Utils.getORMVersion();
        if (process.env.MIKRO_ORM_ALLOW_VERSION_MISMATCH) {
            return coreVersion;
        }
        const deps = this.getORMPackages();
        const exceptions = new Set(['nestjs', 'sql-highlighter', 'mongo-highlighter']);
        const ormPackages = [...deps].filter(d => d.startsWith('@mikro-orm/') && d !== '@mikro-orm/core' && !exceptions.has(d.substring('@mikro-orm/'.length)));
        for (const ormPackage of ormPackages) {
            const version = this.getORMPackageVersion(ormPackage);
            if (version != null && version !== coreVersion) {
                throw new Error(`Bad ${colors_1.colors.cyan(ormPackage)} version ${colors_1.colors.yellow('' + version)}.\n` +
                    `All official @mikro-orm/* packages need to have the exact same version as @mikro-orm/core (${colors_1.colors.green(coreVersion)}).\n` +
                    `Only exceptions are packages that don't live in the 'mikro-orm' repository: ${[...exceptions].join(', ')}.\n` +
                    `Maybe you want to check, or regenerate your yarn.lock or package-lock.json file?`);
            }
        }
        return coreVersion;
    }
}
exports.ConfigurationLoader = ConfigurationLoader;
