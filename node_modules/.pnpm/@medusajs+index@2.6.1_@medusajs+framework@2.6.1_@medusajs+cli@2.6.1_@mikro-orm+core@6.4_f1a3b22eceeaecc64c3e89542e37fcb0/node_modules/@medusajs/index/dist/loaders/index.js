"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awilix_1 = require("awilix");
const postgres_provider_1 = require("../services/postgres-provider");
const utils_1 = require("@medusajs/framework/utils");
const _services_1 = require("../services");
exports.default = async ({ container, options }) => {
    container.register({
        baseRepository: (0, awilix_1.asClass)(utils_1.MikroOrmBaseRepository).singleton(),
        searchModuleService: (0, awilix_1.asClass)(_services_1.IndexModuleService).singleton(),
    });
    container.register("storageProviderCtrOptions", (0, awilix_1.asValue)(undefined));
    container.register("storageProviderCtr", (0, awilix_1.asValue)(postgres_provider_1.PostgresProvider));
    /*if (!options?.customAdapter) {
      container.register("storageProviderCtr", asValue(PostgresProvider))
    }  else {
      container.register(
        "storageProviderCtr",
        asValue(options.customAdapter.constructor)
      )
      container.register(
        "storageProviderCtrOptions",
        asValue(options.customAdapter.options)
      )
    }*/
};
//# sourceMappingURL=index.js.map