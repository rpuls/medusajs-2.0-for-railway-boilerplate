"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveContextProvider = resolveContextProvider;
const EntityRepository_1 = require("../entity/EntityRepository");
const EntityManager_1 = require("../EntityManager");
const MikroORM_1 = require("../MikroORM");
function getEntityManager(caller, context) {
    if (context instanceof EntityManager_1.EntityManager) {
        return context;
    }
    if (context instanceof EntityRepository_1.EntityRepository) {
        return context.getEntityManager();
    }
    if (context instanceof MikroORM_1.MikroORM) {
        return context.em;
    }
    if (caller.em instanceof EntityManager_1.EntityManager) {
        return caller.em;
    }
    if (caller.orm instanceof MikroORM_1.MikroORM) {
        return caller.orm.em;
    }
    return undefined;
}
/**
 * Find `EntityManager` in provided context, or else in instance's `orm` or `em` properties.
 */
async function resolveContextProvider(caller, provider) {
    const context = typeof provider === 'function' ? await provider(caller) : await provider;
    return getEntityManager({ orm: await caller.orm, em: await caller.em }, context);
}
