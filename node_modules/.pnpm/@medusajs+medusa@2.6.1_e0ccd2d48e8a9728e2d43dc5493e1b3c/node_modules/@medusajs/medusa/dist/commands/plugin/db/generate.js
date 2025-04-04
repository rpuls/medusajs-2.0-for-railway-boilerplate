"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
const path_1 = require("path");
const core_1 = require("@mikro-orm/core");
const postgresql_1 = require("@mikro-orm/postgresql");
const TERMINAL_SIZE = process.stdout.columns;
/**
 * Generate migrations for all scanned modules in a plugin
 */
const main = async function ({ directory }) {
    try {
        const moduleDescriptors = [];
        const modulePaths = glob_1.glob.sync((0, utils_1.toUnixSlash)((0, path_1.join)(directory, "src", "modules", "*", "index.ts")));
        for (const path of modulePaths) {
            const moduleDirname = (0, path_1.dirname)(path);
            const serviceName = await getModuleServiceName(path);
            const entities = await getEntitiesForModule(moduleDirname);
            moduleDescriptors.push({
                serviceName,
                migrationsPath: (0, path_1.join)(moduleDirname, "migrations"),
                entities,
            });
        }
        /**
         * Generating migrations
         */
        logger_1.logger.info("Generating migrations...");
        await generateMigrations(moduleDescriptors);
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.info("Migrations generated");
        process.exit();
    }
    catch (error) {
        console.log(new Array(TERMINAL_SIZE).join("-"));
        logger_1.logger.error(error.message, error);
        process.exit(1);
    }
};
async function getEntitiesForModule(path) {
    const entities = [];
    const entityPaths = glob_1.glob.sync((0, utils_1.toUnixSlash)((0, path_1.join)(path, "models", "*.ts")), {
        ignore: ["**/index.{js,ts}", "**/*.d.ts"],
    });
    for (const entityPath of entityPaths) {
        const entityExports = await (0, utils_1.dynamicImport)(entityPath);
        const validEntities = Object.values(entityExports).filter((potentialEntity) => {
            return (utils_1.DmlEntity.isDmlEntity(potentialEntity) ||
                !!core_1.MetadataStorage.getMetadataFromDecorator(potentialEntity));
        });
        entities.push(...validEntities);
    }
    return entities;
}
async function getModuleServiceName(path) {
    const moduleExport = await (0, utils_1.dynamicImport)(path);
    if (!moduleExport.default) {
        throw new Error("The module should default export the `Module()`");
    }
    return moduleExport.default.service.prototype.__joinerConfig()
        .serviceName;
}
async function generateMigrations(moduleDescriptors = []) {
    const DB_HOST = process.env.DB_HOST ?? "localhost";
    const DB_USERNAME = process.env.DB_USERNAME ?? "";
    const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
    const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
    const DATABASE_URL = process.env.DATABASE_URL;
    for (const moduleDescriptor of moduleDescriptors) {
        logger_1.logger.info(`Generating migrations for module ${moduleDescriptor.serviceName}...`);
        const mikroOrmConfig = (0, utils_1.defineMikroOrmCliConfig)(moduleDescriptor.serviceName, {
            entities: moduleDescriptor.entities,
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USERNAME,
            password: DB_PASSWORD,
            ...(DATABASE_URL ? { clientUrl: DATABASE_URL } : {}),
            migrations: {
                path: moduleDescriptor.migrationsPath,
            },
        });
        const orm = await postgresql_1.MikroORM.init(mikroOrmConfig);
        const migrator = orm.getMigrator();
        const result = await migrator.createMigration();
        if (result.fileName) {
            logger_1.logger.info(`Migration created: ${result.fileName}`);
        }
        else {
            logger_1.logger.info(`No migration created`);
        }
    }
}
exports.default = main;
//# sourceMappingURL=generate.js.map