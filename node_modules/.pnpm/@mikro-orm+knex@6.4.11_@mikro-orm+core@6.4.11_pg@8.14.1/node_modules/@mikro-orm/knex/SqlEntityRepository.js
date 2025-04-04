"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlEntityRepository = void 0;
const core_1 = require("@mikro-orm/core");
class SqlEntityRepository extends core_1.EntityRepository {
    em;
    constructor(em, entityName) {
        super(em, entityName);
        this.em = em;
    }
    /**
     * Creates a QueryBuilder instance
     */
    createQueryBuilder(alias) {
        return this.getEntityManager().createQueryBuilder(this.entityName, alias);
    }
    /**
     * Shortcut for `createQueryBuilder()`
     */
    qb(alias) {
        return this.createQueryBuilder(alias);
    }
    /**
     * Returns configured knex instance.
     */
    getKnex(type) {
        return this.getEntityManager().getKnex(type);
    }
    /**
     * @inheritDoc
     */
    getEntityManager() {
        return this.em;
    }
}
exports.SqlEntityRepository = SqlEntityRepository;
