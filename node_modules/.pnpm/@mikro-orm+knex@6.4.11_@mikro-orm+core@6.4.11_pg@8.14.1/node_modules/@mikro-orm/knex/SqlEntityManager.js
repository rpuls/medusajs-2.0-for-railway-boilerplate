"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlEntityManager = void 0;
const core_1 = require("@mikro-orm/core");
/**
 * @inheritDoc
 */
class SqlEntityManager extends core_1.EntityManager {
    /**
     * Creates a QueryBuilder instance
     */
    createQueryBuilder(entityName, alias, type, loggerContext) {
        const context = this.getContext(false);
        return this.driver.createQueryBuilder(entityName, context.getTransactionContext(), type, true, loggerContext ?? context.loggerContext, alias, this);
    }
    /**
     * Shortcut for `createQueryBuilder()`
     */
    qb(entityName, alias, type, loggerContext) {
        return this.createQueryBuilder(entityName, alias, type, loggerContext);
    }
    /**
     * Returns configured knex instance.
     */
    getKnex(type) {
        return this.getConnection(type).getKnex();
    }
    async execute(queryOrKnex, params = [], method = 'all', loggerContext) {
        return this.getDriver().execute(queryOrKnex, params, method, this.getContext(false).getTransactionContext(), loggerContext);
    }
    getRepository(entityName) {
        return super.getRepository(entityName);
    }
    applyDiscriminatorCondition(entityName, where) {
        // this is handled in QueryBuilder now for SQL drivers
        return where;
    }
}
exports.SqlEntityManager = SqlEntityManager;
