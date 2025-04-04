"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmConnectionLoader = mikroOrmConnectionLoader;
const awilix_1 = require("awilix");
const common_1 = require("../../common");
const dal_1 = require("../../dal");
const create_pg_connection_1 = require("../create-pg-connection");
const load_module_database_config_1 = require("../load-module-database-config");
/**
 * Load a MikroORM connection into the container
 *
 * @param moduleName
 * @param container
 * @param options
 * @param filters
 * @param moduleDeclaration
 * @param entities
 * @param pathToMigrations
 */
async function mikroOrmConnectionLoader({ moduleName, container, options, moduleDeclaration, entities, pathToMigrations, }) {
    let manager = options?.manager;
    // Custom manager provided
    if (manager) {
        container.register({
            manager: (0, awilix_1.asValue)(manager),
        });
        return;
    }
    const moduleOptions = options;
    const reuseSharedConnection = moduleOptions[create_pg_connection_1.isSharedConnectionSymbol] || !moduleOptions?.database;
    if (moduleDeclaration?.scope === "internal" && reuseSharedConnection) {
        const shouldSwallowError = true;
        const dbConfig = (0, load_module_database_config_1.loadDatabaseConfig)(moduleName, (options ?? {}), shouldSwallowError);
        return await loadShared({
            database: {
                ...dbConfig,
            },
            container,
            entities,
            pathToMigrations,
        });
    }
    /**
     * Reuse an existing connection if it is passed in the options
     */
    let dbConfig;
    const shouldSwallowError = !!options?.database?.connection;
    dbConfig = {
        ...(0, load_module_database_config_1.loadDatabaseConfig)(moduleName, (options ?? {}), shouldSwallowError),
        connection: options
            ?.database?.connection,
    };
    manager ??= await loadDefault({
        database: {
            ...dbConfig,
        },
        entities,
        pathToMigrations,
    });
    container.register({
        manager: (0, awilix_1.asValue)(manager),
    });
}
async function loadDefault({ database, entities, pathToMigrations, }) {
    if (!database) {
        throw new common_1.MedusaError(common_1.MedusaError.Types.INVALID_ARGUMENT, `Database config is not present at module config "options.database"`);
    }
    const orm = await (0, dal_1.mikroOrmCreateConnection)(database, entities, pathToMigrations);
    return orm.em.fork();
}
async function loadShared({ database, container, entities, pathToMigrations }) {
    const sharedConnection = container.resolve(common_1.ContainerRegistrationKeys.PG_CONNECTION, {
        allowUnregistered: true,
    });
    if (!sharedConnection) {
        throw new Error("The module is setup to use a shared resources but no shared connection is present.");
    }
    const manager = await loadDefault({
        entities,
        database: {
            ...database,
            connection: sharedConnection,
        },
        pathToMigrations,
    });
    container.register({
        manager: (0, awilix_1.asValue)(manager),
    });
}
//# sourceMappingURL=mikro-orm-connection-loader.js.map