"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDatabaseConfig = loadDatabaseConfig;
const common_1 = require("../common");
function getEnv(key, moduleName) {
    const value = process.env[`${moduleName.toUpperCase()}_${key}`] ??
        process.env[`MEDUSA_${key}`] ??
        process.env[`${key}`];
    return value ?? "";
}
function isModuleServiceInitializeOptions(obj) {
    return !!obj?.database;
}
function getDefaultDriverOptions(clientUrl) {
    const localOptions = {
        connection: {
            ssl: false,
        },
    };
    const remoteOptions = {
        connection: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    };
    if (clientUrl) {
        return clientUrl.match(/localhost|127\.0\.0\.1|ssl_mode=(disable|false)/i)
            ? localOptions
            : remoteOptions;
    }
    return process.env.NODE_ENV?.match(/prod/i)
        ? remoteOptions
        : process.env.NODE_ENV?.match(/dev/i)
            ? localOptions
            : {};
}
function getDatabaseUrl(config) {
    const { clientUrl, host, port, user, password, database } = config.database;
    if (host) {
        return `postgres://${user}:${password}@${host}:${port}/${database}`;
    }
    return clientUrl;
}
/**
 * Load the config for the database connection. The options can be retrieved
 * e.g through PRODUCT_* (e.g PRODUCT_DATABASE_URL) or * (e.g DATABASE_URL) environment variables or the options object.
 * @param options
 * @param moduleName
 */
function loadDatabaseConfig(moduleName, options, silent = false) {
    const clientUrl = options?.database?.clientUrl ?? getEnv("DATABASE_URL", moduleName);
    const poolEnvConfig = getEnv("DATABASE_POOL", moduleName);
    const database = {
        clientUrl,
        schema: getEnv("DATABASE_SCHEMA", moduleName) ?? "public",
        driverOptions: JSON.parse(getEnv("DATABASE_DRIVER_OPTIONS", moduleName) ||
            JSON.stringify(getDefaultDriverOptions(clientUrl))),
        pool: poolEnvConfig ? JSON.parse(poolEnvConfig) : undefined,
        debug: false,
        connection: undefined,
    };
    if (isModuleServiceInitializeOptions(options)) {
        database.clientUrl = getDatabaseUrl({
            database: { ...options.database, clientUrl },
        });
        database.schema = options.database.schema ?? database.schema;
        database.driverOptions =
            options.database.driverOptions ??
                getDefaultDriverOptions(database.clientUrl);
        database.pool = options.database.pool ?? database.pool;
        database.debug = options.database.debug ?? database.debug;
        database.connection = options.database.connection;
    }
    if (!database.clientUrl && !silent && !database.connection) {
        throw new common_1.MedusaError(common_1.MedusaError.Types.INVALID_ARGUMENT, "No database clientUrl provided. Please provide the clientUrl through the [MODULE]_DATABASE_URL, MEDUSA_DATABASE_URL or DATABASE_URL environment variable or the options object in the initialize function.");
    }
    return database;
}
//# sourceMappingURL=load-module-database-config.js.map