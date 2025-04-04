"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionLoader = connectionLoader;
const utils_1 = require("@medusajs/framework/utils");
function connectionLoader(entity) {
    return async ({ options, container, logger, }, moduleDeclaration) => {
        const pathToMigrations = __dirname + "/../migrations";
        await utils_1.ModulesSdkUtils.mikroOrmConnectionLoader({
            moduleName: "link_module",
            entities: [entity],
            container,
            options,
            moduleDeclaration,
            logger,
            pathToMigrations,
        });
    };
}
//# sourceMappingURL=connection.js.map