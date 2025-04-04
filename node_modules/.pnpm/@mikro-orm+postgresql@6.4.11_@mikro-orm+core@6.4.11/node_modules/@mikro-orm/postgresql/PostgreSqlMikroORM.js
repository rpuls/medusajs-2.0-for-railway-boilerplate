"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSqlMikroORM = void 0;
exports.definePostgreSqlConfig = definePostgreSqlConfig;
const core_1 = require("@mikro-orm/core");
const PostgreSqlDriver_1 = require("./PostgreSqlDriver");
/**
 * @inheritDoc
 */
class PostgreSqlMikroORM extends core_1.MikroORM {
    static DRIVER = PostgreSqlDriver_1.PostgreSqlDriver;
    /**
     * @inheritDoc
     */
    static async init(options) {
        return super.init(options);
    }
    /**
     * @inheritDoc
     */
    static initSync(options) {
        return super.initSync(options);
    }
}
exports.PostgreSqlMikroORM = PostgreSqlMikroORM;
/* istanbul ignore next */
function definePostgreSqlConfig(options) {
    return (0, core_1.defineConfig)({ driver: PostgreSqlDriver_1.PostgreSqlDriver, ...options });
}
