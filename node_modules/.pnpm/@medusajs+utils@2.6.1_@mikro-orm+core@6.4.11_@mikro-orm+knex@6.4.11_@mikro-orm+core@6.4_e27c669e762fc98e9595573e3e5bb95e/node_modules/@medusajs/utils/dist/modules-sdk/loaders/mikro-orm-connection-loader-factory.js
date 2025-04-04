"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmConnectionLoaderFactory = mikroOrmConnectionLoaderFactory;
const mikro_orm_connection_loader_1 = require("./mikro-orm-connection-loader");
/**
 * Factory for creating a MikroORM connection loader for the modules
 *
 * @param moduleName
 * @param moduleModels
 * @param migrationsPath
 */
function mikroOrmConnectionLoaderFactory({ moduleName, moduleModels, migrationsPath, }) {
    return async function connectionLoader({ options, container, logger }, moduleDeclaration) {
        await (0, mikro_orm_connection_loader_1.mikroOrmConnectionLoader)({
            moduleName,
            entities: moduleModels,
            container,
            options,
            moduleDeclaration,
            logger,
            pathToMigrations: migrationsPath ?? "",
        });
    };
}
//# sourceMappingURL=mikro-orm-connection-loader-factory.js.map